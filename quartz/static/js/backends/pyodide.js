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

    if (packages && packages.length) {
      progressCb?.(
        "Installing Python packages: " + packages.join(", ") + " (first load only)...",
      )
      for (const pkg of packages) {
        await installOne(pkg, progressCb)
      }

      // If matplotlib is present, force a non-interactive backend so
      // plt.show() doesn't try to open a GUI window and figures stay
      // available for our postlude to collect.
      if (packages.includes("matplotlib")) {
        pyodide.runPython(`
import matplotlib
matplotlib.use("Agg")
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

  try {
    // runPythonAsync supports top-level `await` and awaits async user
    // code, which runPython does not. Preferred for interactive use.
    await pyodide.runPythonAsync(code)
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
