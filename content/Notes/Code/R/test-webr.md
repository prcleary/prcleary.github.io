---
title: Test webR
date: 2026-07-02
---

Live R interpreter test.

<pre id="webr-diag" style="background:#eef; padding:0.5rem; font-size:0.85em;"></pre>

<div id="r-demo-1" class="r-runner">
  <textarea></textarea>
  <div class="r-controls">
    <button onclick="runR('r-demo-1')">Run</button>
    <span class="r-spinner" style="display:none">⏳</span>
  </div>
  <pre class="r-console"></pre>
  <div class="r-plot"></div>
</div>

<script>
  // Register the COI service worker at site root so SharedArrayBuffer works.
  // First load: SW installs, page reloads once, then COI headers are applied.
  (function () {
    var diag = document.getElementById('webr-diag');
    function report() {
      diag.textContent =
        'crossOriginIsolated: ' + self.crossOriginIsolated + '\n' +
        'SharedArrayBuffer available: ' + (typeof SharedArrayBuffer !== 'undefined') + '\n' +
        'SW controller: ' + (navigator.serviceWorker && navigator.serviceWorker.controller
          ? navigator.serviceWorker.controller.scriptURL : 'none');
    }
    report();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (reg) {
        if (!navigator.serviceWorker.controller) {
          // First-time install: reload once so the SW can control this page.
          diag.textContent += '\nInstalled SW – reloading to activate COI…';
          setTimeout(function () { window.location.reload(); }, 500);
        } else {
          report();
        }
      }).catch(function (err) {
        diag.textContent += '\nSW register error: ' + err;
      });
    }
  })();
</script>

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