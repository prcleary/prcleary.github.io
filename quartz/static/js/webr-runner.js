/*
 * webr-runner.js — run R in the browser from within Quartz pages.
 *
 * Usage: add
 *
 *     <script type="module" src="/static/js/webr-runner.js"></script>
 *
 * anywhere on a markdown page. Every fenced ```r code block on that page then
 * gets a "▶ Run" button appended; clicking it evaluates the block and shows
 * text output + any plots produced. State (variables, functions, loaded
 * packages) persists between runs within the same page load, so blocks can
 * refer to objects defined earlier.
 *
 * Only pages that include the <script> tag above are affected — R blocks on
 * other pages are untouched.
 *
 * The block contents are read from the rendered HTML written by you. There is
 * no editable widget: visitors can only run the exact code you published.
 * (webR runs in a WASM sandbox with its own virtual filesystem, so even if
 *  a visitor forges a call through DevTools, it cannot read the host machine.)
 *
 * Optional diagnostic:
 *     <pre id="webr-diag"></pre>
 *
 * Cross-origin isolation (needed for SharedArrayBuffer) is provided by the
 * root-scope /sw.js emitted by the COIServiceWorker Quartz plugin.
 */

/* -------- 1. Register cross-origin isolation service worker -------- */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => {
      updateDiag();
      if (!navigator.serviceWorker.controller) {
        // First-time install: reload once so the SW can apply COOP/COEP headers.
        setTimeout(() => window.location.reload(), 500);
      }
    })
    .catch((err) => updateDiag("SW register error: " + err));
}

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

/* -------- 2. webR lifecycle -------- */

// Packages installed and attached on first run. Add/remove here to change
// what's available by default in every ```r block.
const DEFAULT_PACKAGES = ["data.table", "ggplot2"];

let webR = null;
let ready = false;
let starting = null;
let progressCb = null;

function reportProgress(msg) {
  if (progressCb) progressCb(msg);
}

async function startWebR() {
  if (ready) return;
  if (starting) return starting;
  if (!self.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Cross-origin isolation not active. Reload the page once so the service worker can take effect.",
    );
  }
  starting = (async () => {
    reportProgress("Loading webR runtime...");
    const mod = await import("https://webr.r-wasm.org/latest/webr.mjs");
    webR = new mod.WebR();
    await webR.init();

    if (DEFAULT_PACKAGES.length) {
      reportProgress("Installing packages: " + DEFAULT_PACKAGES.join(", ") + " (first load only)...");
      await webR.evalRVoid(
        `webr::install(c(${DEFAULT_PACKAGES.map((p) => `"${p}"`).join(", ")}))`,
      );
      reportProgress("Loading packages...");
      for (const pkg of DEFAULT_PACKAGES) {
        await webR.evalRVoid(`suppressPackageStartupMessages(library(${pkg}))`);
      }
    }

    ready = true;
  })();
  return starting;
}

/* -------- 3. Runner -------- */

async function runR(container) {
  if (typeof container === "string") container = document.getElementById(container);
  const consoleEl = container.querySelector(".r-console");
  const plotEl = container.querySelector(".r-plot");
  const spinner = container.querySelector(".r-spinner");

  consoleEl.textContent = "";
  if (plotEl) plotEl.innerHTML = "";
  if (spinner) spinner.style.display = "inline-block";

  progressCb = (msg) => {
    consoleEl.textContent = msg;
  };

  try {
    if (!ready) {
      await startWebR();
      consoleEl.textContent = "";
    }

    const code = container.dataset.staticCode || "";
    const shelter = await new webR.Shelter();
    try {
      const result = await shelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
        captureConditions: false,
        captureGraphics: { width: 600, height: 400 },
      });

      const text = result.output.map((o) => o.data).join("\n");
      consoleEl.textContent = text || "(no text output)";

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
      shelter.purge();
    }
  } catch (err) {
    consoleEl.textContent += "\n" + String(err);
  } finally {
    if (spinner) spinner.style.display = "none";
    progressCb = null;
  }
}
window.runR = runR;

/* -------- 4. Augment fenced ```r blocks with a Run button -------- */

function augmentRBlock(pre) {
  if (pre.dataset.webrAugmented === "1") return;
  pre.dataset.webrAugmented = "1";

  const code = pre.querySelector("code");
  if (!code) return;
  const source = code.innerText.replace(/\n$/, "");

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
  pre.parentNode.insertBefore(container, pre.nextSibling);
}

function augmentAllRBlocks() {
  document.querySelectorAll('pre[data-language="r"]').forEach(augmentRBlock);
}

/* -------- 5. Boot -------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", augmentAllRBlocks);
} else {
  augmentAllRBlocks();
}

// Quartz SPA navigation: re-augment on new pages.
window.addEventListener("nav", augmentAllRBlocks);
