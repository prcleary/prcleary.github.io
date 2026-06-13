---
title: Interactive R in the blog using WASM
---

<div id="r-global-status" style="margin-bottom:1em; font-weight:bold;"></div>

## Try `data.table`


<div class="r-box">
<textarea class="r-input">
DT <- data.table(x = 1:5)
DT
</textarea>
<button class="r-run">Run</button>
<span class="r-spinner" style="display:none;"></span>
<pre class="r-console"></pre>
</div>

<div class="r-box">
<textarea class="r-input">
DT[, sum(x)]
</textarea>
<button class="r-run">Run</button>
<span class="r-spinner" style="display:none;"></span>
<pre class="r-console"></pre>
</div>
