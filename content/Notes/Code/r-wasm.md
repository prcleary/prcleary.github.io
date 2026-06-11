---
title: Interactive R in the blog using WASM
---

## Try R

<div id="q1" class="r-box">

<textarea class="r-input">
1 + 1
</textarea>

<button class="r-run">Run</button>
<span class="r-spinner" style="display:none;">Starting R runtime...</span>

<pre class="r-console"></pre>
<div class="r-plot"></div>

</div>

<script type="module">
import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";

const webR = new WebR();

let webRReady = (async () => {
  const spinner = document.querySelector("#q1 .r-spinner");
  spinner.style.display = "inline";

  await webR.init();
  await webR.installPackages(["data.table"]);
  console.log("WebR initialized");

  spinner.style.display = "none";
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

document.querySelector("#q1 .r-run")
  .addEventListener("click", () => runRInBox("q1"));
</script>
