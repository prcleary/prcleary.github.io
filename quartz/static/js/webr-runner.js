/* =====================================================================
 * webr-runner.js
 * ---------------------------------------------------------------------
 * A note for R users reading this on trust:
 *
 * This file is JavaScript. JavaScript is the language your web browser
 * runs when it loads a page. Everything below is executed inside YOUR
 * OWN browser — not on any server. It does the following, and nothing
 * else:
 *
 *   1. Registers a "service worker" (a small background script the
 *      browser keeps between page loads) whose only job is to add two
 *      HTTP response headers that the browser requires before it will
 *      allow WebAssembly (webR) to use SharedArrayBuffer.
 *   2. Downloads webR (an R interpreter compiled to WebAssembly) from
 *      https://webr.r-wasm.org the first time you click a Run button.
 *   3. Installs the R packages listed in DEFAULT_PACKAGES below by
 *      downloading pre-built binaries from https://repo.r-wasm.org.
 *   4. When you click a Run button, evaluates the exact text of the
 *      code block above it in the webR sandbox and displays the text
 *      output plus any plots that were drawn.
 *
 * It does NOT:
 *   - send your code, results, or any other data to any server that
 *     wasn't already involved in loading webR and its packages;
 *   - read or modify any files on your computer (webR has its own
 *     sandboxed virtual filesystem separate from your OS);
 *   - track you, set cookies, or use analytics.
 *
 * The three outside network dependencies are:
 *   /sw.js                                (this site)
 *   https://webr.r-wasm.org/latest/…      (the webR runtime)
 *   https://repo.r-wasm.org/…             (R package binaries)
 *
 * =====================================================================
 *
 * A short glossary for R users seeing JavaScript concepts below:
 *
 *   async / await    — JavaScript's way of writing code that waits for
 *                      slow things (a download, a computation) without
 *                      freezing the page. Roughly analogous to R's
 *                      `future` / `promises` packages, but built into
 *                      the language.
 *
 *   Promise          — the object you `await`. Like a `future`.
 *
 *   function () {…}  — defines a function. `() => …` is a shorter
 *                      arrow-function form.
 *
 *   const / let      — variable declarations. `const` can't be
 *                      reassigned (like `const<-` if R had it).
 *
 *   document, self,
 *   navigator, window — global objects your browser gives every page.
 *                      `document` is the current page's HTML tree;
 *                      `self` and `window` refer to the page itself.
 *
 *   querySelector    — find an HTML element by CSS selector, like
 *                      rvest::html_element() in R.
 *
 *   addEventListener — attach a function that runs when something
 *                      happens (click, page load, etc.).
 *
 * ===================================================================== */

/* -------- 0. Configuration ------------------------------------------ */

// R packages installed and attached the first time any Run button on
// any page is clicked. Add or remove packages here to change what is
// available by default in every fenced ```r code block. Anything on
// https://repo.r-wasm.org/ can be listed. If a package you want isn't
// there, the block will need to install it itself with webr::install().
const DEFAULT_PACKAGES = ["data.table", "ggplot2"];

/* -------- 1. Register the cross-origin isolation service worker ---- */

// A "service worker" is a small script the browser runs in the
// background, separate from any page. Once installed, it can intercept
// every network request the page makes and modify the response before
// the page sees it. We use this to add two HTTP headers
// (Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy) that
// the browser demands before it will expose SharedArrayBuffer, which
// webR needs to run.
//
// The worker file itself is /sw.js, written to the site root by our
// Quartz plugin quartz/plugins/emitters/coiServiceWorker.ts.

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => {
      // Registration succeeded. Update the on-page diagnostic (if any).
      updateDiag();

      // A subtlety: the first time a browser sees the service worker,
      // the CURRENT page load already happened without its help, so
      // that page is NOT cross-origin isolated. We force a single
      // reload; from then on the SW is in control and every page load
      // gets the extra headers.
      if (!navigator.serviceWorker.controller) {
        setTimeout(() => window.location.reload(), 500);
      }
    })
    .catch((err) => updateDiag("SW register error: " + err));
}

/* -------- 2. Optional visible diagnostic ----------------------------- */

// If the page includes an element like <pre id="webr-diag"></pre>, we
// populate it with a small status readout. Handy for confirming
// cross-origin isolation is active without having to open DevTools.
function updateDiag(extra) {
  const diag = document.getElementById("webr-diag");
  if (!diag) return;
  const lines = [
    "crossOriginIsolated: " + self.crossOriginIsolated,
    "SharedArrayBuffer available: " + (typeof SharedArrayBuffer !== "undefined"),
    "SW controller: " +
      (navigator.serviceWorker && navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.scriptURL
        : "none"),
  ];
  if (extra) lines.push(extra);
  diag.textContent = lines.join("\n");
}
updateDiag();

/* -------- 3. webR lifecycle ---------------------------------------- */

// Module-level state. `webR` holds the webR instance once created,
// `ready` becomes true once packages are attached, and `starting`
// holds the in-progress startup Promise so simultaneous clicks on
// several Run buttons don't try to start webR more than once.
let webR = null;
let ready = false;
let starting = null;

// The runR function below sets progressCb to a callback so startWebR
// can write "Loading webR runtime..." etc. into the correct block's
// console area. Cleared again once startup finishes.
let progressCb = null;
function reportProgress(msg) {
  if (progressCb) progressCb(msg);
}

// startWebR does the one-off work of downloading webR, initialising
// it, and installing + attaching the default packages. It is safe to
// call any number of times: subsequent calls return the same in-flight
// Promise, and once startup is complete they return immediately.
async function startWebR() {
  if (ready) return;
  if (starting) return starting;

  // Belt-and-braces check: without cross-origin isolation, webR.init()
  // would hang forever. Fail fast with a message the user can act on.
  if (!self.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Cross-origin isolation not active. Reload the page once so the service worker can take effect.",
    );
  }

  starting = (async () => {
    reportProgress("Loading webR runtime...");
    // Dynamic import: fetches webR's JavaScript module at runtime,
    // rather than at the top of the file, so pages that never trigger
    // a Run don't pay the download cost.
    const mod = await import("https://webr.r-wasm.org/latest/webr.mjs");

    webR = new mod.WebR();
    await webR.init();

    if (DEFAULT_PACKAGES.length) {
      reportProgress(
        "Installing packages: " + DEFAULT_PACKAGES.join(", ") + " (first load only)...",
      );
      // webr::install() downloads pre-built WASM binaries from
      // https://repo.r-wasm.org/ (webR's CRAN-like mirror). Much
      // faster than install.packages() would be, because there is no
      // compilation step.
      await webR.evalRVoid(
        `webr::install(c(${DEFAULT_PACKAGES.map((p) => `"${p}"`).join(", ")}))`,
      );

      reportProgress("Loading packages...");
      // Attach each package, suppressing the usual startup chatter so
      // it doesn't clutter the user's first output.
      for (const pkg of DEFAULT_PACKAGES) {
        await webR.evalRVoid(`suppressPackageStartupMessages(library(${pkg}))`);
      }
    }

    ready = true;
  })();

  return starting;
}

/* -------- 4. Runner (evaluate an R block and display its output) --- */

// runR is called when a Run button is clicked. `container` is the
// small <div class="r-runner-inline"> we injected next to the code
// block; it holds the code text, plus the console and plot areas
// where we display output.
async function runR(container) {
  // Allow callers to pass an id string instead of the element itself.
  if (typeof container === "string") container = document.getElementById(container);

  const consoleEl = container.querySelector(".r-console"); // text output goes here
  const plotEl = container.querySelector(".r-plot");       // canvas images go here
  const spinner = container.querySelector(".r-spinner");   // "running..." label

  // Reset any output from previous runs.
  consoleEl.textContent = "";
  if (plotEl) plotEl.innerHTML = "";
  if (spinner) spinner.style.display = "inline-block";

  // Route startup progress messages to this block's console.
  progressCb = (msg) => {
    consoleEl.textContent = msg;
  };

  try {
    // Boot webR if this is the first Run on this page load.
    if (!ready) {
      await startWebR();
      consoleEl.textContent = "";
    }

    // The R source is stored verbatim on the container. See section 5.
    const code = container.dataset.staticCode || "";

    // A Shelter is a webR feature that groups temporary R objects so
    // they can be freed together. Roughly analogous to withr::with_*()
    // in R — anything created inside is cleaned up when we .purge().
    const shelter = await new webR.Shelter();
    try {
      // captureR evaluates R code and returns the collected output.
      //   withAutoprint    — print visible top-level results, as the
      //                      interactive R console would.
      //   captureStreams   — collect stdout and stderr.
      //   captureGraphics  — render any base or ggplot output to an
      //                      ImageBitmap at the given pixel size.
      const result = await shelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
        captureConditions: false,
        captureGraphics: { width: 600, height: 400 },
      });

      // result.output is an array of {type, data} entries — 'stdout',
      // 'stderr', etc. Join them into one string for display.
      const text = result.output.map((o) => o.data).join("\n");
      consoleEl.textContent = text || "(no text output)";

      // result.images is an array of ImageBitmap objects, one per
      // plot the R code produced. Draw each to its own <canvas>.
      if (plotEl && result.images && result.images.length) {
        for (const img of result.images) {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.style.maxWidth = "100%";
          canvas.style.height = "auto";
          canvas.style.background = "white";
          canvas.style.border = "1px solid var(--lightgray)";
          canvas.style.borderRadius = "4px";
          canvas.style.marginTop = "0.5rem";
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          plotEl.appendChild(canvas);
        }
      }
    } finally {
      // Free the temporary R objects, regardless of success.
      shelter.purge();
    }
  } catch (err) {
    // Any JavaScript error (webR crashed, network failed, etc.) — or
    // an R error that escaped captureR — shows up here.
    consoleEl.textContent += "\n" + String(err);
  } finally {
    if (spinner) spinner.style.display = "none";
    progressCb = null;
  }
}

// Expose runR globally so inline onclick="runR(...)" handlers (used
// in the widgets we inject below) can find it.
window.runR = runR;

/* -------- 5. Turn every ```r block into a runnable widget ---------- */

// Quartz's syntax highlighter renders a ```r fenced block as an
// element like:
//     <pre tabindex="0" data-language="r">
//       <code data-language="r">…coloured spans…</code>
//     </pre>
// For each such <pre>, we insert a small companion widget beneath it
// containing a Run button, a text console, and a plot area. The raw
// source of the block is copied into a data-attribute on the widget
// so runR() can read it without touching the syntax-highlighted DOM.
function augmentRBlock(pre) {
  // Guard against double processing (Quartz's SPA nav may re-run us).
  if (pre.dataset.webrAugmented === "1") return;
  pre.dataset.webrAugmented = "1";

  const code = pre.querySelector("code");
  if (!code) return;

  // .innerText returns the visible text with layout applied, so it
  // strips the styling spans and preserves line breaks. Trim one
  // trailing newline that Shiki tends to add.
  const source = code.innerText.replace(/\n$/, "");

  // Build the widget:
  //   <div class="r-runner-inline" data-static-code="…the R code…">
  //     <div class="r-controls">
  //       <button>▶ Run</button>
  //       <span class="r-spinner">running…</span>
  //     </div>
  //     <pre class="r-console"></pre>
  //     <div class="r-plot"></div>
  //   </div>
  const container = document.createElement("div");
  container.className = "r-runner-inline";
  container.dataset.staticCode = source;

  const controls = document.createElement("div");
  controls.className = "r-controls";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "▶ Run";
  btn.addEventListener("click", () => runR(container));

  const spinner = document.createElement("span");
  spinner.className = "r-spinner";
  spinner.style.display = "none";
  spinner.textContent = " running…";

  controls.appendChild(btn);
  controls.appendChild(spinner);

  const output = document.createElement("pre");
  output.className = "r-console";

  const plot = document.createElement("div");
  plot.className = "r-plot";

  container.appendChild(controls);
  container.appendChild(output);
  container.appendChild(plot);

  // Insert the widget as the next sibling of the <pre>.
  pre.parentNode.insertBefore(container, pre.nextSibling);
}

// Scan the whole page for every ```r block and augment each once.
function augmentAllRBlocks() {
  document.querySelectorAll('pre[data-language="r"]').forEach(augmentRBlock);
}

/* -------- 6. Boot ---------------------------------------------------- */

// If the browser is still parsing the HTML, wait until it's done;
// otherwise run immediately.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", augmentAllRBlocks);
} else {
  augmentAllRBlocks();
}

// Quartz uses single-page-application navigation: clicking an internal
// link swaps the article contents without a full reload, then fires a
// "nav" event. Re-run our scan so new pages get their Run buttons too.
window.addEventListener("nav", augmentAllRBlocks);
