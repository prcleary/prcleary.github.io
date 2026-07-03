/* =====================================================================
 * code-runner.js
 * ---------------------------------------------------------------------
 * Generic runnable-code-block harness for Quartz posts. Opt-in per page
 * with a single script tag:
 *
 *   <script type="module"
 *           src="/static/js/code-runner.js"
 *           data-language="r"
 *           data-packages="data.table,ggplot2,dplyr"></script>
 *
 *   <script type="module"
 *           src="/static/js/code-runner.js"
 *           data-language="python"
 *           data-packages="numpy,pandas,matplotlib,scikit-learn"></script>
 *
 * `data-language` is required: "r" or "python".
 * `data-packages` is optional: comma-separated list. If omitted, the
 * backend's built-in defaults are used (data.table, ggplot2 for R;
 * numpy, pandas, matplotlib for Python).
 *
 * The shell:
 *   1. Registers the /sw.js service worker so pages become
 *      cross-origin isolated (needed by webR; harmless for Pyodide).
 *   2. Updates an optional <pre id="code-runner-diag"> element with the
 *      current isolation state.
 *   3. Dynamically imports the backend for the chosen language on
 *      first Run click (so pages that never trigger a Run pay no
 *      download cost).
 *   4. Scans the page for every <pre data-language="{lang}"> — the
 *      rendered form of ```{lang} fenced blocks — and appends a Run
 *      button plus console + plot output area to each.
 *   5. Re-scans on Quartz's SPA `nav` event.
 *
 * A note for R / Python users reading this on trust: this file is
 * JavaScript executed entirely inside YOUR browser. It does not send
 * your code or results to any server that wasn't already involved in
 * loading the R / Python runtime and their packages. It does not read
 * files on your computer. The two outside network dependencies are the
 * language runtime (webr.r-wasm.org or cdn.jsdelivr.net/pyodide) and
 * their pre-built package repositories.
 * ===================================================================== */

/* -------- 0. Read configuration from the script tag ----------------- */

// Bump on every deploy so you can tell at a glance in DevTools console
// whether the browser is running the freshly-deployed code or a cached
// copy. If you don't see this exact string logged after a page load,
// clear site data (DevTools -> Application -> Storage -> Clear site data)
// and reload.
const CODE_RUNNER_VERSION = "2026-07-03.9 (Pyodide: unpkg fallback for Firefox Android dynamic-import failure)"
console.log("[code-runner] version:", CODE_RUNNER_VERSION)

// document.currentScript is null in ES modules, so we locate our own
// tag by src pattern. This lets us read the data-* attributes the post
// author set.
const scriptEl = document.querySelector(
  'script[src*="code-runner.js"], script[src*="code-runner.mjs"]',
)
const LANGUAGE = (scriptEl?.dataset.language || "").trim().toLowerCase()
const PACKAGES_ATTR = scriptEl?.dataset.packages
const USER_PACKAGES = PACKAGES_ATTR
  ? PACKAGES_ATTR.split(",")
      .map((p) => p.trim())
      .filter(Boolean)
  : null // null = use backend default

if (!LANGUAGE) {
  console.error(
    "code-runner: missing data-language on <script> tag. Expected 'r' or 'python'.",
  )
}

/* -------- 1. Service worker for cross-origin isolation -------------- */

// Registered unconditionally: R needs SharedArrayBuffer (requires COI),
// Python doesn't but is unharmed by it. The SW file itself is written
// to the site root by quartz/plugins/emitters/coiServiceWorker.ts.

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", {
      scope: "/",
      // Bypass the HTTP cache when checking for /sw.js updates. Without
      // this, GitHub Pages' default Cache-Control: max-age=600 on /sw.js
      // means browsers may keep serving an old SW for up to 10 minutes
      // after a deploy. With updateViaCache: "none", every update check
      // fetches /sw.js fresh, so a fixed SW rolls out on the next
      // navigation regardless of the HTTP cache.
      updateViaCache: "none",
    })
    .then(() => {
      updateDiag()
      // First time the browser sees the SW, this page loaded WITHOUT
      // the COI headers. Reload once so the SW takes effect. Skipped
      // on subsequent visits (already controlled).
      if (!navigator.serviceWorker.controller) {
        setTimeout(() => window.location.reload(), 500)
      }
    })
    .catch((err) => updateDiag("SW register error: " + err))
}

/* -------- 2. Optional visible diagnostic ---------------------------- */

// Populated only if the page includes an element like
//   <pre id="code-runner-diag"></pre>
// Handy for confirming cross-origin isolation without opening DevTools.
function updateDiag(extra) {
  const diag = document.getElementById("code-runner-diag")
  if (!diag) return
  const lines = [
    "language: " + (LANGUAGE || "(none)"),
    "crossOriginIsolated: " + self.crossOriginIsolated,
    "SharedArrayBuffer available: " + (typeof SharedArrayBuffer !== "undefined"),
    "SW controller: " +
      (navigator.serviceWorker && navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.scriptURL
        : "none"),
  ]
  if (extra) lines.push(extra)
  diag.textContent = lines.join("\n")
}
updateDiag()

/* -------- 2.5. Prevent Quartz SPA nav from leaking COI to other pages
 *
 * Cross-origin-isolated capability is a per-document setting: once this
 * page has been loaded with COOP/COEP headers (via the SW-triggered
 * reload above), the document keeps those restrictions for its entire
 * lifetime.
 *
 * Quartz's SPA navigation (enableSPA in quartz.config.ts) does NOT
 * create a new document on link clicks. It fetches the destination
 * HTML, injects the article content into the current DOM, and updates
 * the URL. So SPA-navigating from a code-runner page to, say,
 * /Bookmarks keeps this same COI document active — with the URL now
 * saying /Bookmarks but the document still cross-origin isolated. Any
 * cross-origin iframe (Karakeep, YouTube, ...) or cross-origin font
 * (Google Fonts) in the destination gets blocked by COEP.
 *
 * Fix: intercept clicks on same-origin links from this page and force
 * a full browser navigation. The destination then loads in a fresh
 * document that gets its own headers evaluated cleanly.
 *
 * External links, new-tab clicks (target=_blank, Ctrl/Cmd+click, middle
 * click), hash-only fragments, and downloads are left alone.
 * ------------------------------------------------------------------- */

document.addEventListener(
  "click",
  (e) => {
    if (!self.crossOriginIsolated) return
    if (e.defaultPrevented) return
    if (e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = e.target.closest && e.target.closest("a[href]")
    if (!link) return
    if (link.target && link.target !== "_self") return
    if (link.hasAttribute("download")) return
    const href = link.getAttribute("href")
    if (!href || href.startsWith("#")) return
    let url
    try {
      url = new URL(href, window.location.href)
    } catch {
      return
    }
    if (url.origin !== window.location.origin) return
    // Same-origin navigation from a COI page — force full reload so we
    // don't drag the COI state into a page that doesn't want it.
    e.preventDefault()
    e.stopImmediatePropagation()
    window.location.href = url.href
  },
  true, // capture phase, run before Quartz's SPA click handler
)

/* -------- 3. Backend lifecycle -------------------------------------- */

// Loaded lazily on first Run so pages that never execute anything pay
// nothing. `backendPromise` is memoised so parallel Run clicks share
// one import.
let backend = null
let backendPromise = null
let initialised = false
let initPromise = null
let progressCb = null

async function loadBackend() {
  if (backend) return backend
  if (backendPromise) return backendPromise

  backendPromise = (async () => {
    let mod
    switch (LANGUAGE) {
      case "r":
        mod = await import("./backends/webr.js")
        break
      case "python":
      case "py":
        mod = await import("./backends/pyodide.js")
        break
      default:
        throw new Error(
          `code-runner: unknown language "${LANGUAGE}". Use data-language="r" or data-language="python".`,
        )
    }
    backend = mod.backend
    return backend
  })()

  return backendPromise
}

async function ensureReady(reportProgress) {
  const b = await loadBackend()

  if (b.requiresCOI && (!self.crossOriginIsolated || typeof SharedArrayBuffer === "undefined")) {
    throw new Error(
      "Cross-origin isolation not active. Reload the page once so the service worker can take effect.",
    )
  }

  if (initialised) return b
  if (initPromise) return initPromise

  const packages = USER_PACKAGES ?? b.defaultPackages
  progressCb = reportProgress
  initPromise = (async () => {
    try {
      await b.init(packages, (msg) => progressCb?.(msg))
      initialised = true
      return b
    } finally {
      progressCb = null
    }
  })()
  return initPromise
}

/* -------- 4. Runner (evaluate a block, display its output) ---------- */

async function runBlock(container) {
  if (typeof container === "string") container = document.getElementById(container)

  const consoleEl = container.querySelector(".code-runner-console")
  const plotEl = container.querySelector(".code-runner-plot")
  const spinner = container.querySelector(".code-runner-spinner")

  consoleEl.textContent = ""
  if (plotEl) plotEl.innerHTML = ""
  if (spinner) spinner.style.display = "inline-block"

  const reportProgress = (msg) => {
    consoleEl.textContent = msg
  }

  try {
    const b = await ensureReady(reportProgress)
    if (consoleEl.textContent) consoleEl.textContent = "" // clear progress msg

    const code = container.dataset.staticCode || ""
    const { text, images } = await b.run(code)
    consoleEl.textContent = text || "(no text output)"

    if (plotEl && images && images.length) {
      for (const img of images) {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        canvas.style.maxWidth = "100%"
        canvas.style.height = "auto"
        canvas.style.background = "white"
        canvas.style.border = "1px solid var(--lightgray)"
        canvas.style.borderRadius = "4px"
        canvas.style.marginTop = "0.5rem"
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        plotEl.appendChild(canvas)
      }
    }
  } catch (err) {
    consoleEl.textContent += "\n" + String(err?.message ?? err)
  } finally {
    if (spinner) spinner.style.display = "none"
  }
}

// Exposed globally in case a post wants to trigger a run programmatically.
window.runCodeBlock = runBlock

/* -------- 5. Turn every ```{lang} block into a runnable widget ----- */

function augmentBlock(pre) {
  if (pre.dataset.codeRunnerAugmented === "1") return
  pre.dataset.codeRunnerAugmented = "1"

  const code = pre.querySelector("code")
  if (!code) return

  // .innerText strips syntax-highlight spans and preserves line breaks.
  // Trim one trailing newline that Shiki tends to append.
  const source = code.innerText.replace(/\n$/, "")

  const container = document.createElement("div")
  container.className = "code-runner-inline"
  container.dataset.staticCode = source

  const controls = document.createElement("div")
  controls.className = "code-runner-controls"

  const btn = document.createElement("button")
  btn.type = "button"
  btn.textContent = "▶ Run"
  btn.addEventListener("click", () => runBlock(container))

  const spinner = document.createElement("span")
  spinner.className = "code-runner-spinner"
  spinner.style.display = "none"
  spinner.style.marginLeft = "0.75rem"
  spinner.textContent = "⏳ Running…"

  controls.appendChild(btn)
  controls.appendChild(spinner)

  const output = document.createElement("pre")
  output.className = "code-runner-console"

  const plot = document.createElement("div")
  plot.className = "code-runner-plot"

  container.appendChild(controls)
  container.appendChild(output)
  container.appendChild(plot)

  pre.parentNode.insertBefore(container, pre.nextSibling)
}

function augmentAllBlocks() {
  if (!LANGUAGE) return
  document
    .querySelectorAll(`pre[data-language="${LANGUAGE}"]`)
    .forEach(augmentBlock)
}

/* -------- 6. Boot --------------------------------------------------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", augmentAllBlocks)
} else {
  augmentAllBlocks()
}

// Quartz's SPA nav: re-scan when the article contents are swapped in.
window.addEventListener("nav", augmentAllBlocks)
