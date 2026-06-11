---
title: Interactive R in the blog using WASM
---

<script type="module" src="/static/js/webr-fast.js"></script>
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/sw.js');
}
</script>

## Try R

<div id="q1" class="r-box">

<textarea>
1 + 1
</textarea>

<button onclick="runR('q1')">Run</button>
<span class="r-spinner"></span>

<pre class="r-console"></pre>
<div class="r-plot"></div>

</div>

<script>
initEditor("q1", `1 + 1`);
</script>
