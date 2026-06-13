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

<script type="module" src="/static/js/r-wasm.js"></script>