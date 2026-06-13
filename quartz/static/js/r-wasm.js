const webRModule = await import("https://webr.r-wasm.org/latest/webr.mjs");
const { WebR } = webRModule;

const webR = new WebR();

let webRReady = (async () => {
  const spinner = document.querySelector("#q1 .r-spinner");
  if (spinner) spinner.style.display = "inline";

  await webR.init();
  console.log("WebR initialized");

  if (spinner) spinner.style.display = "none";
})();

async function runRInBox(boxId) {
  const box = document.getElementById(boxId);
  const textarea = box.querySelector(".r-input");
  const consoleEl = box.querySelector(".r-console");
  const spinner = box.querySelector(".r-spinner");

  spinner.style.display = "inline";
  consoleEl.textContent = "";

  await webRReady;

  try {
    const result = await webR.evalR(textarea.value);
    consoleEl.textContent = result.toString();
  } catch (err) {
    consoleEl.textContent = err;
  }

  spinner.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#q1 .r-run");
  if (button) {
    button.addEventListener("click", () => runRInBox("q1"));
  }
});
