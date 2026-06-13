// quartz/static/js/r-wasm.js

const webRModule = await import("https://webr.r-wasm.org/latest/webr.mjs");
const { WebR } = webRModule;

const webR = new WebR();

let webRReady = (async () => {
  const spinner = document.querySelector("#q1 .r-spinner");
  if (spinner) {
    spinner.style.display = "inline";
    spinner.textContent = "Starting R runtime...";
  }

  // Start R
  await webR.init();

  if (spinner) spinner.textContent = "Installing data.table...";

  // Install data.table (safe to call even if already installed in this session)
  await webR.installPackages(["data.table"]);

  console.log("WebR initialized and data.table installed");

  if (spinner) {
    spinner.style.display = "none";
    spinner.textContent = "Starting R runtime...";
  }
})();

async function runRInBox(boxId) {
  const box = document.getElementById(boxId);
  const textarea = box.querySelector(".r-input");
  const consoleEl = box.querySelector(".r-console");
  const spinner = box.querySelector(".r-spinner");

  spinner.style.display = "inline";
  spinner.textContent = "Running...";
  consoleEl.textContent = "";

  await webRReady;

  try {
    const result = await webR.evalR(textarea.value);
    const output = await result.toString();
    consoleEl.textContent = output;
  } catch (err) {
    consoleEl.textContent = err.message || String(err);
  }

  spinner.style.display = "none";
  spinner.textContent = "Starting R runtime...";
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#q1 .r-run");
  if (button) {
    button.addEventListener("click", () => runRInBox("q1"));
  }
});
