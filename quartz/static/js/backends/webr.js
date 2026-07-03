/* =====================================================================
 * backends/webr.js
 * ---------------------------------------------------------------------
 * R backend for code-runner.js. Wraps webR (https://webr.r-wasm.org) —
 * an R interpreter compiled to WebAssembly — behind the small interface
 * the shell expects:
 *
 *   { language, displayName, requiresCOI, defaultPackages,
 *     init(packages, progressCb), run(code) }
 *
 * `init()` is idempotent and safe to call from concurrent Run clicks
 * (it de-duplicates via an in-flight Promise). `run()` returns
 *   { text: string, images: ImageBitmap[] }
 * which the shell knows how to display.
 *
 * State (variables, attached packages, loaded data) persists across
 * every run() call on the same page load, exactly as an interactive
 * R session would.
 * ===================================================================== */

// The runtime URL is intentionally the `latest/` alias published by
// the r-wasm project. Pin to a specific version (e.g. .../v0.6.0/webr.mjs)
// if you want reproducible behaviour across future webR releases.
const WEBR_RUNTIME_URL = "https://webr.r-wasm.org/latest/webr.mjs"

let webR = null
let ready = false
let starting = null

async function init(packages, progressCb) {
  if (ready) return
  if (starting) return starting

  // Fail fast if the page is not cross-origin isolated. Without it,
  // SharedArrayBuffer is unavailable and webR.init() would hang forever.
  if (!self.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Cross-origin isolation not active. Reload the page once so the service worker can take effect.",
    )
  }

  starting = (async () => {
    progressCb?.("Loading webR runtime...")
    const mod = await import(/* @vite-ignore */ WEBR_RUNTIME_URL)
    webR = new mod.WebR()
    await webR.init()

    if (packages && packages.length) {
      progressCb?.(
        "Installing R packages: " + packages.join(", ") + " (first load only)...",
      )
      // Pre-built WASM binaries from repo.r-wasm.org — much faster than
      // install.packages() because there is no compilation step.
      await webR.evalRVoid(
        `webr::install(c(${packages.map((p) => `"${p}"`).join(", ")}))`,
      )

      progressCb?.("Loading R packages...")
      for (const pkg of packages) {
        await webR.evalRVoid(`suppressPackageStartupMessages(library(${pkg}))`)
      }
    }

    ready = true
  })()

  return starting
}

async function run(code) {
  // A Shelter groups temporary R objects so we can free them together.
  // Roughly analogous to withr::with_*() in R.
  const shelter = await new webR.Shelter()
  try {
    // captureR options:
    //   withAutoprint       — emit the same auto-printed output an R REPL
    //                         would produce for bare expressions on the
    //                         last line of a block (e.g. `mean(x)`).
    //   captureStreams      — collect stdout+stderr into result.output
    //                         instead of letting webR write to console.
    //   captureConditions   — false: let messages/warnings/errors flow
    //                         through as normal stderr text, matching
    //                         how the interactive R console looks. If
    //                         set true, webR would return them as
    //                         structured objects the shell would then
    //                         have to format itself.
    //   captureGraphics     — render any plots the block produces to a
    //                         600x400 canvas and return them as
    //                         ImageBitmaps in result.images.
    const result = await shelter.captureR(code, {
      withAutoprint: true,
      captureStreams: true,
      captureConditions: false,
      captureGraphics: { width: 600, height: 400 },
    })
    const text = result.output.map((o) => o.data).join("\n")
    const images = result.images || []
    return { text, images }
  } finally {
    shelter.purge()
  }
}

export const backend = {
  language: "r",
  displayName: "R",
  requiresCOI: true,
  defaultPackages: ["data.table", "ggplot2"],
  init,
  run,
}
