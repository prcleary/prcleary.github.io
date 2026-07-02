/*
 * webr-runner.js — self-contained bootstrap for embedded R code blocks.
 *
 * Markdown usage:
 *   <pre id="webr-diag"></pre>            (optional visible diagnostic)
 *   <div class="r-runner" id="r-1" data-default="1 + 1">
 *     <textarea></textarea>
 *     <button onclick="runR(this.closest('.r-runner'))">Run</button>
 *     <span class="r-spinner" style="display:none">running...</span>
 *     <pre class="r-console"></pre>
 *   </div>
 *   <script type="module" src="/static/js/webr-runner.js"></script>
 */

/* ---------- 1. Register cross-origin isolation service worker ---------- */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(function () {
      updateDiag();
      if (!navigator.serviceWorker.controller) {
        // First-time install: reload once so the SW can apply COOP/COEP headers.
        setTimeout(function () {
          window.location.reload();
        }, 500);
      }
    })
    .catch(function (err) {
      updateDiag("SW register error: " + err);
    });
}

/* ---------- 2. Visible diagnostic (optional) ---------- */

function updateDiag(extra) {
  var diag = document.getElementById("webr-diag");
  if (!diag) return;
  var lines = [
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

/* ---------- 3. webR lifecycle ---------- */

let webR = null;
let ready = false;
let starting = null;

async function startWebR() {
  if (ready) return;
  if (starting) return starting;

  if (!self.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Cross-origin isolation not active. Reload the page once so the service worker can take effect.",
    );
  }

  starting = (async () => {
    const mod = await import("https://webr.r-wasm.org/latest/webr.mjs");
    webR = new mod.WebR();
    await webR.init();
    ready = true;
  })();

  return starting;
}

/* ---------- 4. Runner ---------- */

async function runR(container) {
  if (typeof container === "string") container = document.getElementById(container);
  const consoleEl = container.querySelector(".r-console");
  const spinner = container.querySelector(".r-spinner");
  const textarea = container.querySelector("textarea");

  consoleEl.textContent = "";
  if (spinner) spinner.style.display = "inline-block";

  try {
    if (!ready) {
      consoleEl.textContent = "Starting R runtime (first run may take ~10s)...\n";
      await startWebR();
      consoleEl.textContent = "";
    }

    const code = textarea.value;
    saveCode(container.id, code);

    const shelter = await new webR.Shelter();
    try {
      const result = await shelter.captureR(code, { withAutoprint: true });
      const text = result.output.map((o) => o.data).join("\n");
      consoleEl.textContent += text || "(no output)";
    } finally {
      shelter.purge();
    }
  } catch (err) {
    consoleEl.textContent += String(err);
  } finally {
    if (spinner) spinner.style.display = "none";
  }
}
window.runR = runR;

/* ---------- 5. Local storage of edits ---------- */

function saveCode(id, code) {
  if (!id) return;
  try {
    localStorage.setItem("webr_code_" + id, code);
  } catch (e) {}
}
function loadCode(id, fallback) {
  if (!id) return fallback;
  try {
    return localStorage.getItem("webr_code_" + id) || fallback;
  } catch (e) {
    return fallback;
  }
}

/* ---------- 6. Editor init (plain textarea, no CodeMirror) ---------- */

function initRunner(container) {
  if (container.dataset.initialized === "1") return;
  container.dataset.initialized = "1";
  const textarea = container.querySelector("textarea");
  if (!textarea) return;
  const defaultCode = container.getAttribute("data-default") || "";
  textarea.value = loadCode(container.id, defaultCode);
  textarea.rows = Math.max(4, textarea.value.split("\n").length + 1);
  textarea.style.width = "100%";
  textarea.style.fontFamily = "monospace";
  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      runR(container);
    }
  });
}

function initAllRunners() {
  document.querySelectorAll(".r-runner").forEach(initRunner);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllRunners);
} else {
  initAllRunners();
}

// Quartz SPA navigation re-fires this event on new pages
window.addEventListener("nav", initAllRunners);
