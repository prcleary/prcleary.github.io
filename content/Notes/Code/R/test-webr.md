---
title: Test webR
date: 2026-07-02
---

Live R interpreter test.

<pre id="webr-diag" style="background:#eef; padding:0.5rem; font-size:0.85em;"></pre>

## Editable widget (CodeMirror)

<div id="r-demo-1" class="r-runner" data-default="x <- rnorm(100); summary(x)">
  <textarea></textarea>
  <div class="r-controls">
    <button onclick="runR(this.closest('.r-runner'))">Run</button>
    <span class="r-spinner" style="display:none">running...</span>
  </div>
  <pre class="r-console"></pre>
</div>

## Ordinary fenced R block — auto Run button

```r
x <- 1:10
mean(x)
sd(x)
```

## Another one, using an object from the previous run

```r
x + 100
```

<script type="module" src="/static/js/webr-runner.js"></script>

<style>
  .r-runner { border: 1px solid var(--lightgray); border-radius: 6px; padding: 0.5rem; margin: 1rem 0; }
  .r-runner .r-controls { margin: 0.5rem 0; }
  .r-runner .r-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; }
  .r-runner-inline { padding: 0.25rem 0; border: none; margin-top: -0.5rem; }
  .r-runner-inline button { font-size: 0.85em; padding: 0.1rem 0.5rem; }
</style>

