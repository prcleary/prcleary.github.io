const webRModule = await import("https://webr.r-wasm.org/latest/webr.mjs");
const { WebR } = webRModule;

const webR = new WebR();
let webRReady;

// ---------- INITIALIZE ONCE ----------
async function initWebR() {
  const globalSpinner = document.querySelector("#r-global-status");

  if (globalSpinner) {
    globalSpinner.style.display = "block";
    globalSpinner.textContent = "Starting R runtime...";
  }

  await webR.init();

  if (globalSpinner) {
    globalSpinner.textContent = "Installing data.table...";
  }

  await webR.installPackages(["data.table"]);

  // Preload library so users don't have to
  await webR.evalR(`library(data.table)`);

  if (globalSpinner) {
    globalSpinner.textContent = "R ready.";
    setTimeout(() => {
      globalSpinner.style.display = "none";
    }, 1000);
  }

  console.log("WebR ready with data.table");
}

webRReady = initWebR();

// ---------- RUN CODE (SHARED SESSION) ----------
async function runRInBox(box) {
  const textarea = box.querySelector(".r-input");
  const consoleEl = box.querySelector(".r-console");
  const spinner = box.querySelector(".r-spinner");

  spinner.style.display = "inline";
  spinner.textContent = "Running...";
  consoleEl.textContent = "";

  await webRReady;

  try {
    const wrappedCode = `
      paste(
        capture.output({
          ${textarea.value}
        }),
        collapse = "\n"
      )
    `;

    const output = await webR.evalRString(wrappedCode);
    consoleEl.textContent = output;
  } catch (err) {
    consoleEl.textContent = err.message || String(err);
  }

  spinner.style.display = "none";
  spinner.textContent = "";
}

// ---------- AUTO-WIRE ALL R BOXES ----------
document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".r-box");

  boxes.forEach((box) => {
    const button = box.querySelector(".r-run");
    if (button) {
      button.addEventListener("click", () => runRInBox(box));
    }
  });
});
