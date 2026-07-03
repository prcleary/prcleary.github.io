/* =====================================================================
 * backends/pyodide.js
 * ---------------------------------------------------------------------
 * Python backend for code-runner.js. Wraps Pyodide
 * (https://pyodide.org) — CPython 3.12 compiled to WebAssembly — behind
 * the same small interface the R backend uses:
 *
 *   { language, displayName, requiresCOI, defaultPackages,
 *     init(packages, progressCb), run(code) }
 *
 * A note for Python users reading this on trust:
 *
 * Pyodide runs entirely inside YOUR OWN browser. It downloads its
 * runtime and pre-built package binaries from jsdelivr.net (the CDN
 * the Pyodide project publishes to) and PyPI (only if you use
 * micropip). It has NO access to your local filesystem; its `open()`
 * sees only the sandboxed virtual filesystem provided by
 * WebAssembly / Emscripten.
 *
 * State (variables, imported modules, DataFrames, model objects)
 * persists across every run() call on the same page load. This matches
 * how a Jupyter notebook feels — each cell can build on the last.
 *
 * Plot handling: after evaluating your code we look for any open
 * matplotlib figures and render each to a PNG. The shell displays
 * them below the console output as canvas images, exactly like R.
 * ===================================================================== */

// Pin to a specific Pyodide release for reproducibility. The Pyodide
// team ships a `full/pyodide.mjs` at every version; bumping this URL
// is the only change needed to upgrade the runtime.
const PYODIDE_VERSION = "v0.27.7"
const PYODIDE_RUNTIME_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.mjs`
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

let pyodide = null
let ready = false
let starting = null

// Python postlude executed after every user block to collect any
// matplotlib figures the block produced. Returns a list of PNG byte
// arrays (one per figure), then closes the figures so they don't
// re-appear on subsequent runs.
const COLLECT_FIGURES_PY = `
def _code_runner_collect_figures():
    try:
        import matplotlib.pyplot as _plt
        import io as _io
    except ImportError:
        return []
    _out = []
    for _n in _plt.get_fignums():
        _fig = _plt.figure(_n)
        _buf = _io.BytesIO()
        _fig.savefig(_buf, format='png', bbox_inches='tight', dpi=100)
        _buf.seek(0)
        _out.append(_buf.getvalue())
        _plt.close(_fig)
    return _out
_code_runner_collect_figures()
`

/**
 * Try to install a package with the fastest available method:
 *   1. Pyodide's own pre-built binary via loadPackage
 *   2. Fall back to micropip for pure-Python packages on PyPI
 * We swallow the loadPackage failure quietly because it's an expected
 * "not in the pre-built repo" signal, not an error the user needs to
 * see.
 */
async function installOne(pkg, progressCb) {
  try {
    await pyodide.loadPackage(pkg)
    return
  } catch (_e) {
    // fall through to micropip
  }
  progressCb?.(`Installing ${pkg} from PyPI via micropip...`)
  await pyodide.loadPackage("micropip")
  const micropip = pyodide.pyimport("micropip")
  await micropip.install(pkg)
}

// Installed into Pyodide's globals during init() so run() can call it.
// The transform function rewrites the user's code so that any bare
// expression appearing as the last top-level statement gets wrapped in
// a display call — mirroring how the interactive Python REPL (or a
// Jupyter cell) auto-prints the value of the last expression. Without
// this, blocks like `df.head()` or `{"mean": x.mean()}` compute the
// right thing but produce no visible text output because
// runPythonAsync only *returns* the value, it doesn't print it.
//
// _code_runner_display() skips matplotlib Figures (they're already
// captured by our postlude, so printing `<Figure size ...>` would just
// be noise) and skips None (which is what most non-expression
// statements evaluate to; also what functions like print() return).
const REPL_HELPERS_PY = `
import ast as _ast

def _code_runner_display(value):
    if value is None:
        return
    try:
        from matplotlib.figure import Figure as _Fig
        if isinstance(value, _Fig):
            return
    except ImportError:
        pass
    try:
        text = repr(value)
    except Exception:
        text = str(value)
    print(text)

def _code_runner_transform(source):
    # PyCF_ALLOW_TOP_LEVEL_AWAIT so user blocks may use \`await\` at the top level.
    try:
        tree = compile(
            source, '<code-block>', 'exec',
            flags=_ast.PyCF_ONLY_AST | _ast.PyCF_ALLOW_TOP_LEVEL_AWAIT,
            dont_inherit=True,
        )
    except SyntaxError:
        return source  # let Pyodide surface the SyntaxError with a real traceback
    if tree.body and isinstance(tree.body[-1], _ast.Expr):
        last = tree.body[-1]
        tree.body[-1] = _ast.Expr(
            value=_ast.Call(
                func=_ast.Name(id='_code_runner_display', ctx=_ast.Load()),
                args=[last.value],
                keywords=[],
            )
        )
        _ast.fix_missing_locations(tree)
    try:
        return _ast.unparse(tree)
    except Exception:
        return source
`

async function init(packages, progressCb) {
  if (ready) return
  if (starting) return starting

  starting = (async () => {
    progressCb?.("Loading Pyodide runtime (first load only)...")

    // Dynamic import so pages that never trigger a Run don't pay the
    // download cost. The `indexURL` tells Pyodide where to fetch its
    // WebAssembly binary and stdlib payload from.
    const mod = await import(/* @vite-ignore */ PYODIDE_RUNTIME_URL)
    pyodide = await mod.loadPyodide({ indexURL: PYODIDE_INDEX_URL })

    // Preload micropip so `import micropip` works in any user block
    // without first calling `pyodide.loadPackage("micropip")`. It's
    // small (~50 KB) and part of the standard Pyodide distribution.
    await pyodide.loadPackage("micropip")

    // Install the REPL-style auto-display helpers into Python globals
    // so run() can transform each block before execution.
    pyodide.runPython(REPL_HELPERS_PY)

    if (packages && packages.length) {
      progressCb?.(
        "Installing Python packages: " + packages.join(", ") + " (first load only)...",
      )
      for (const pkg of packages) {
        await installOne(pkg, progressCb)
      }

      // If matplotlib is present:
      //  1. Force a non-interactive backend so plt.show() doesn't try to
      //     open a GUI window and figures stay available for our postlude.
      //  2. Warm up font_manager NOW rather than on the user's first Run.
      //     In Pyodide the first font-metric query triggers a font-cache
      //     rebuild that can take 30-90s and prints "Matplotlib is building
      //     the font cache; this may take a moment." to stderr. Doing it
      //     during init means the wait is attributed to the visible
      //     "Loading Python packages..." progress line, and the first Run
      //     click starts drawing immediately.
      if (packages.includes("matplotlib")) {
        progressCb?.("Warming up matplotlib font cache (first load only, may take up to a minute)...")
        pyodide.runPython(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as _plt
import io as _io
_fig, _ax = _plt.subplots()
_ax.text(0.5, 0.5, "warmup")
_buf = _io.BytesIO()
_fig.savefig(_buf, format="png")   # forces font_manager to build its cache
_plt.close(_fig)
del _fig, _ax, _buf
`)
      }
    }

    ready = true
  })()

  return starting
}

async function run(code) {
  const chunks = []

  // Route Python's stdout/stderr into our buffer. `batched` means
  // Pyodide calls us with whole lines rather than individual chars.
  pyodide.setStdout({ batched: (s) => chunks.push(s + "\n") })
  pyodide.setStderr({ batched: (s) => chunks.push(s + "\n") })

  // Rewrite the block so its last bare expression prints its repr,
  // matching interactive REPL behaviour. Falls back to the original
  // source on any transform failure so errors surface naturally.
  let effectiveCode = code
  try {
    const transform = pyodide.globals.get("_code_runner_transform")
    if (transform) {
      const transformed = transform(code)
      if (typeof transformed === "string") effectiveCode = transformed
      transform.destroy?.()
    }
  } catch (_e) {
    // If the transform itself blows up, run the user's code verbatim.
    effectiveCode = code
  }

  try {
    // runPythonAsync supports top-level `await` and awaits async user
    // code, which runPython does not. Preferred for interactive use.
    await pyodide.runPythonAsync(effectiveCode)
  } catch (err) {
    // Python errors surface as JS exceptions with the formatted
    // traceback in .message — display it like the interactive REPL would.
    chunks.push(String(err.message ?? err))
  }

  // Collect any matplotlib figures the code produced.
  let images = []
  try {
    const pyBytesList = pyodide.runPython(COLLECT_FIGURES_PY)
    if (pyBytesList) {
      // Convert the Python list-of-bytes proxy into a JS array of
      // Uint8Array copies, then release the proxy to free memory on
      // the Python side.
      const jsBytesList = pyBytesList.toJs({ create_proxies: false })
      pyBytesList.destroy?.()
      for (const bytes of jsBytesList) {
        const blob = new Blob([bytes], { type: "image/png" })
        const bitmap = await createImageBitmap(blob)
        images.push(bitmap)
      }
    }
  } catch (_e) {
    // Matplotlib absent, or figure collection failed — either way,
    // don't let it hide the user's actual output.
  }

  return { text: chunks.join(""), images }
}

export const backend = {
  language: "python",
  displayName: "Python",
  // Pyodide doesn't strictly need SharedArrayBuffer; leaving the SW
  // active is harmless (it just adds a couple of response headers).
  requiresCOI: false,
  defaultPackages: ["numpy", "pandas", "matplotlib"],
  init,
  run,
}
