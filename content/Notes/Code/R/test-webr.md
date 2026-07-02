---
title: Test webR
date: 2026-07-02
---

Live R interpreter test.

<div id="r-demo-1" class="r-runner">
  <textarea></textarea>
  <div class="r-controls">
    <button onclick="runR('r-demo-1')">Run</button>
    <span class="r-spinner" style="display:none">⏳</span>
  </div>
  <pre class="r-console"></pre>
  <div class="r-plot"></div>
</div>

<script type="module" src="/static/js/webr-fast.js"></script>
<script type="module">
  const boot = () => window.initEditor
    ? window.initEditor("r-demo-1", `x <- rnorm(100)\nsummary(x)\nhist(x)`)
    : setTimeout(boot, 50);
  boot();
</script>

<style>
  .r-runner { border: 1px solid var(--lightgray); border-radius: 6px; padding: 0.5rem; margin: 1rem 0; }
  .r-runner .cm-editor { border: 1px solid var(--lightgray); border-radius: 4px; min-height: 6em; }
  .r-runner .r-controls { margin: 0.5rem 0; }
  .r-runner .r-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; }
  .r-runner .r-plot svg { max-width: 100%; height: auto; background: white; }
</style>