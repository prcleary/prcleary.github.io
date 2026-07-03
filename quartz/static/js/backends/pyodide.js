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

// Pin to a specific Pyodide release for reproducibility. Bumping this
// version is the only change needed to upgrade the runtime — nothing
// is vendored into the repo; every URL below is derived from it.
const PYODIDE_VERSION = "0.27.7"

const JSDELIVR_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

/**
 * Standard loader: dynamically `import()` pyodide.mjs from `indexURL`,
 * then call loadPyodide({ indexURL }). Pyodide's own bootstrap then does
 * a nested `import(indexURL + "pyodide.asm.js")` and fetches its .wasm,
 * stdlib, lockfile and wheels via plain fetch() from `indexURL`.
 * This is the happy path on every browser that supports it.
 */
async function loadStandard(indexURL) {
  const mod = await import(/* @vite-ignore */ indexURL + "pyodide.mjs")
  return await mod.loadPyodide({ indexURL })
}

/**
 * Same-origin bypass loader for browsers whose SW-mediated cross-origin
 * dynamic `import()` path is broken under COOP/COEP require-corp
 * (observed: Firefox for Android, all versions to date). Plain
 * cross-origin `fetch()` still works on those browsers, so:
 *
 *   1. fetch(indexURL + "pyodide.asm.js") as text, then indirect-eval
 *      it in global scope. The file is Emscripten classic-script output
 *      whose first statement is `var _createPyodideModule = ...`, which
 *      installs the factory as a property of the global object.
 *   2. fetch(indexURL + "pyodide.mjs") as text and import() it from a
 *      `blob:` URL. Blob URLs are treated as same-origin, so the buggy
 *      cross-origin module-fetch path is never entered.
 *   3. Call loadPyodide({ indexURL }). pyodide.mjs contains an explicit
 *      `if (typeof _createPyodideModule !== "function") { ...import... }`
 *      gate, so with the factory pre-defined it never issues the
 *      cross-origin `import()` of pyodide.asm.js. Every remaining
 *      asset (.wasm, stdlib, lockfile, wheels) is fetched with fetch(),
 *      which works fine on the affected browsers.
 *
 * This bypass depends on two Pyodide-side facts that have held across
 * every 0.x release to date:
 *   • pyodide.asm.js is a classic script defining a global var factory.
 *   • pyodide.mjs guards its internal .asm.js import behind a typeof
 *     check on that global.
 * If a future Pyodide release drops either, this fallback needs a look.
 */
async function loadSameOriginBypass(indexURL) {
  async function fetchText(url) {
    const res = await fetch(url, { credentials: "omit" })
    if (!res.ok) throw new Error(`fetch ${url}: HTTP ${res.status}`)
    return await res.text()
  }

  // 1. Install _createPyodideModule on the global object so pyodide.mjs
  //    skips its own dynamic import of pyodide.asm.js.
  if (typeof globalThis._createPyodideModule !== "function") {
    const asmText = await fetchText(indexURL + "pyodide.asm.js")
    // Indirect eval: runs in global scope, so `var _createPyodideModule`
    // becomes globalThis._createPyodideModule.
    ;(0, eval)(asmText)
    if (typeof globalThis._createPyodideModule !== "function") {
      throw new Error(
        "pyodide.asm.js evaluated but did not define _createPyodideModule; " +
          "Pyodide's classic-script contract may have changed.",
      )
    }
  }

  // 2. Load pyodide.mjs via a same-origin blob: URL.
  const mjsText = await fetchText(indexURL + "pyodide.mjs")
  const blob = new Blob([mjsText], { type: "text/javascript" })
  const blobURL = URL.createObjectURL(blob)
  let mod
  try {
    mod = await import(/* @vite-ignore */ blobURL)
  } finally {
    URL.revokeObjectURL(blobURL)
  }

  // 3. Standard loadPyodide with indexURL pointing at the real CDN so
  //    every non-import asset (wasm, stdlib, lockfile, wheels) resolves
  //    against it via fetch().
  return await mod.loadPyodide({ indexURL })
}

// Ordered list of loader strategies. Each entry is fully self-contained:
// on failure the outer loop just tries the next one. All entries point at
// the same jsDelivr base URL — the only variable is HOW the runtime
// module is brought in.
const PYODIDE_MIRRORS = [
  {
    name: "jsDelivr (dynamic import)",
    indexURL: JSDELIVR_BASE,
    load: loadStandard,
  },
  {
    name: "jsDelivr (same-origin blob bypass)",
    indexURL: JSDELIVR_BASE,
    load: loadSameOriginBypass,
  },
]

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

    // Try each loader strategy in order until one produces a working
    // pyodide instance. `loadStandard` is the fast happy path on
    // browsers that can dynamically import the cross-origin pyodide.mjs
    // under COI; `loadSameOriginBypass` is the workaround for Firefox
    // Android (see the comment on PYODIDE_MIRRORS above).
    let lastErr = null
    pyodide = null
    for (let i = 0; i < PYODIDE_MIRRORS.length; i++) {
      const { name, indexURL, load } = PYODIDE_MIRRORS[i]
      if (i > 0) {
        progressCb?.(`Retrying Pyodide via fallback strategy (${name})...`)
      }
      try {
        pyodide = await load(indexURL)
        break
      } catch (err) {
        lastErr = err
        console.warn(`[pyodide] strategy "${name}" failed:`, err)
      }
    }
    if (!pyodide) {
      throw new Error(
        `Pyodide failed to load from any configured mirror. Last error: ${
          lastErr?.message ?? lastErr
        }`,
      )
    }

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
