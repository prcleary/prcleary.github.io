import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";

let webR;
let ready = false;

/* ---------- FAST INITIALIZATION ---------- */

async function startWebR() {
  if (ready) return;

  webR = new WebR();
  await webR.init();

  // Load packages directly (NO install checks = faster)
  await webR.evalR(`
    options(repos=c(CRAN="https://repo.r-wasm.org/"))
    library(data.table)
    library(ggplot2)
  `);

  ready = true;
}

// Start immediately in background
document.addEventListener("DOMContentLoaded", () => {
  startWebR();
});

/* ---------- LOCAL STORAGE ---------- */

function saveCode(id, code) {
  localStorage.setItem("emanote_r_code_" + id, code);
}

function loadCode(id, fallback) {
  return localStorage.getItem("emanote_r_code_" + id) || fallback;
}

/* ---------- RUNNER ---------- */

window.runR = async function(id) {
  const container = document.getElementById(id);
  const consoleEl = container.querySelector(".r-console");
  const plotEl = container.querySelector(".r-plot");
  const spinner = container.querySelector(".r-spinner");

  consoleEl.textContent = "";
  plotEl.innerHTML = "";
  spinner.style.display = "inline-block";

  if (!ready) {
    consoleEl.textContent = "Starting R runtime...\n";
    await startWebR();
    consoleEl.textContent = "";
  }

  const code = container.cmView.state.doc.toString();
  saveCode(id, code);

  try {
    const result = await webR.evalR(`
      tmp <- tempfile(fileext=".svg")
      svg(tmp)
      value <- withVisible(eval(parse(text=${JSON.stringify(code)})))
      dev.off()

      list(
        value=value$value,
        visible=value$visible,
        plot=if (file.exists(tmp)) readLines(tmp) else NULL
      )
    `);

    const output = await result.toJs();

    if (output.visible && output.value !== null) {
      consoleEl.textContent += JSON.stringify(output.value, null, 2) + "\n";
    }

    if (output.plot) {
      plotEl.innerHTML = output.plot.join("\n");
    }

  } catch (err) {
    consoleEl.textContent += err.toString();
  }

  spinner.style.display = "none";
};

/* ---------- EDITOR ---------- */

window.initEditor = async function(id, defaultCode) {
  const container = document.getElementById(id);
  const textarea = container.querySelector("textarea");

  const code = loadCode(id, defaultCode);
  textarea.value = code;

  const { EditorView, basicSetup } = await import(
    "https://cdn.jsdelivr.net/npm/codemirror@6.0.1/+esm"
  );
  const { r } = await import(
    "https://cdn.jsdelivr.net/npm/@codemirror/lang-r@6.0.1/+esm"
  );
  const { oneDark } = await import(
    "https://cdn.jsdelivr.net/npm/@codemirror/theme-one-dark@6.1.2/+esm"
  );

  const view = new EditorView({
    doc: textarea.value,
    extensions: [
      basicSetup,
      r(),
      oneDark,
      EditorView.domEventHandlers({
        keydown(event) {
          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            runR(id);
          }
        }
      })
    ],
    parent: textarea.parentNode
  });

  textarea.remove();
  container.cmView = view;
};

