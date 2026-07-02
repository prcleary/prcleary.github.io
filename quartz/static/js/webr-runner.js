/*
 * webr-runner.js — run R in the browser from within Quartz pages.
 *
 * Usage in a markdown page: add
 *
 *     <script type="module" src="/static/js/webr-runner.js"></script>
 *
 * anywhere on the page. That does two things:
 *
 * 1. Every fenced ```r code block on that page gets a "Run" button appended.
 *    Clicking it evaluates the code and shows the output below.
 *
 * 2. Any explicit editable widget of the form
 *
 *        <div class="r-runner" id="unique-id" data-default="1 + 1">
 *          <textarea></textarea>
 *          <button onclick="runR(this.closest('.r-runner'))">Run</button>
 *          <pre class="r-console"></pre>
 *        </div>
 *
 *    is upgraded to a CodeMirror editor pre-filled with data-default (or the
 *    last edit from localStorage).
 *
 * Optional: add
 *
 *     <pre id="webr-diag"></pre>
 *
 * to see cross-origin isolation status.
 *
 * Cross-origin isolation is provided by /sw.js (a coi-serviceworker style
 * worker emitted by the COIServiceWorker Quartz plugin).
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

/* -------- 3. CodeMirror (lazy) -------- */

let cmPromise = null;
function loadCodeMirror() {
  if (cmPromise) return cmPromise;
  cmPromise = (async () => {
    const cm = await import("https://esm.sh/codemirror@6.0.1");
    const lang = await import("https://esm.sh/@codemirror/language@6");
    const rMode = await import("https://esm.sh/@codemirror/legacy-modes@6/mode/r");
    const theme = await import("https://esm.sh/@codemirror/theme-one-dark@6.1.2");
    return {
      EditorView: cm.EditorView,
      basicSetup: cm.basicSetup,
      rLanguage: lang.StreamLanguage.define(rMode.r),
      oneDark: theme.oneDark,
    };
  })();
  return cmPromise;
}

async function makeEditor(container, initialCode) {
  const { EditorView, basicSetup, rLanguage, oneDark } = await loadCodeMirror();
  const textarea = container.querySelector("textarea");
  const view = new EditorView({
    doc: initialCode,
    extensions: [
      basicSetup,
      rLanguage,
      oneDark,
      EditorView.domEventHandlers({
        keydown(event) {
          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            runR(container);
          }
        },
      }),
    ],
    parent: textarea.parentNode,
  });
  textarea.style.display = "none";
  container.cmView = view;
  return view;
}

/* -------- 4. Runner -------- */

async function runR(container) {
  if (typeof container === "string") container = document.getElementById(container);
  const consoleEl = container.querySelector(".r-console");
  const spinner = container.querySelector(".r-spinner");

  consoleEl.textContent = "";
  if (spinner) spinner.style.display = "inline-block";

  try {
    if (!ready) {
      consoleEl.textContent = "Starting R runtime (first run may take ~10s)...\n";
      await startWebR();
      consoleEl.textContent = "";
    }

    let code;
    if (container.cmView) {
      code = container.cmView.state.doc.toString();
    } else if (container.dataset.staticCode) {
      code = container.dataset.staticCode;
    } else {
      code = container.querySelector("textarea").value;
    }
    saveCode(container.id, code);

    const shelter = await new webR.Shelter();
    try {
      const result = await shelter.captureR(code, { withAutoprint: true });
      const text = result.output.map((o) => o.data).join("\n");
      consoleEl.textContent = text || "(no output)";
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

/* -------- 5. Local storage of edits -------- */

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

/* -------- 6. Init explicit .r-runner widgets (CodeMirror-backed) -------- */

function initRunnerWidget(container) {
  if (container.dataset.initialized === "1") return;
  container.dataset.initialized = "1";
  const defaultCode = container.getAttribute("data-default") || "";
  const initialCode = loadCode(container.id, defaultCode);
  makeEditor(container, initialCode).catch((err) => {
    // CodeMirror failed to load; fall back to plain textarea.
    const textarea = container.querySelector("textarea");
    if (textarea) {
      textarea.value = initialCode;
      textarea.rows = Math.max(4, initialCode.split("\n").length + 1);
      textarea.style.width = "100%";
      textarea.style.fontFamily = "monospace";
    }
    console.warn("CodeMirror failed to load, falling back to textarea:", err);
  });
}

/* -------- 7. Augment fenced ```r blocks with a Run button -------- */

function augmentRBlock(pre) {
  if (pre.dataset.webrAugmented === "1") return;
  pre.dataset.webrAugmented = "1";

  const code = pre.querySelector("code");
  if (!code) return;
  const source = code.innerText.replace(/\n$/, "");

  const container = document.createElement("div");
  container.className = "r-runner r-runner-inline";
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

  container.appendChild(controls);
  container.appendChild(output);
  pre.parentNode.insertBefore(container, pre.nextSibling);
}

function augmentAllRBlocks() {
  document.querySelectorAll('pre[data-language="r"]').forEach(augmentRBlock);
}

/* -------- 8. Boot -------- */

function initAll() {
  document.querySelectorAll(".r-runner:not(.r-runner-inline)").forEach(initRunnerWidget);
  augmentAllRBlocks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

// Quartz SPA navigation: re-init on new pages.
window.addEventListener("nav", initAll);
