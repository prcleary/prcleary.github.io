---
title: Test webR
date: 2026-07-02
---

Live R interpreter test.

<pre id="webr-diag" style="background:#eef; padding:0.5rem; font-size:0.85em;"></pre>

<div id="r-demo-1" class="r-runner" data-default="x <- rnorm(100); summary(x)">
  <textarea></textarea>
  <div class="r-controls">
    <button onclick="runR(this.closest('.r-runner'))">Run</button>
    <span class="r-spinner" style="display:none">running...</span>
  </div>
  <pre class="r-console"></pre>
</div>

<script type="module" src="/static/js/webr-runner.js"></script>

<style>
  .r-runner { border: 1px solid var(--lightgray); border-radius: 6px; padding: 0.5rem; margin: 1rem 0; }
  .r-runner .r-controls { margin: 0.5rem 0; }
  .r-runner .r-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; }
</style>
