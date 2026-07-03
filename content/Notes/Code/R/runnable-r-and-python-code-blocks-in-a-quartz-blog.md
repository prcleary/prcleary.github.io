---
title: Runnable R and Python code blocks in a Quartz blog
date: 2026-07-02
lastmod: 2026-07-03
tags:
  - R
  - Python
  - Quartz
  - WebAssembly
  - webR
  - Pyodide
  - epidemiology
  - teaching
author: GitHub Copilot
---

> This page was authored by GitHub Copilot (Claude Opus 4.7) as an AI pair-programmer, working with Paul Cleary to design, implement, and debug the solution described. It doubles as a live demonstration: every R code block below has a Run button. Because the runner is single-language per page, this page is opted in to R; Python examples further down are shown as static code but will run live on any page opted in with `data-language="python"` — see the [Python live demo](/Notes/Code/Python/runnable-python-code-blocks-demo) for a working companion page.

## What this gives you

Any fenced code block on any Quartz page that opts in becomes runnable in the visitor's browser:

- R code blocks (opened with ```` ```r ````) are evaluated by [webR](https://docs.r-wasm.org/webr/latest/) — an R 4.x interpreter compiled to WebAssembly.
- Python code blocks (opened with ```` ```python ````) are evaluated by [Pyodide](https://pyodide.org/) — CPython 3.12 compiled to WebAssembly.

Both run entirely client-side. No server, no back end, no per-visitor cost. Common packages (`data.table`, `ggplot2` for R; `numpy`, `pandas`, `matplotlib` for Python) load automatically; plots render as canvas images below each block. State persists across every block on the same page load, so blocks can build on each other like cells in a notebook.

Try it — click Run below (this page is opted in to R):

> [!note] DuckDuckGo Browser users
> DuckDuckGo Browser's tracker blocking blocks the WebAssembly runtimes (webR at `webr.r-wasm.org`, Pyodide at `cdn.jsdelivr.net`) and the R package mirror at `repo.r-wasm.org` as third-party requests — so Run buttons here will not work. Worse, after the runtime download fails, the service worker + isolation state left in your tab causes subsequent same-tab navigations to other pages on this site (e.g. [Bookmarks](/Bookmarks)) to fail with *Web page not available — ERR_BLOCKED_BY_RESPONSE*. To recover: close and reopen the tab. To make the runnable code work: tap the shield icon in the address bar and turn Site Privacy Protection off for this site. Every other major browser (Chrome, Firefox, Safari, Edge, on desktop and mobile) works out of the box.

<pre id="code-runner-diag" style="background:var(--lightgray); padding:0.5rem; font-size:0.85em; border-radius:4px;"></pre>

```r
x <- rnorm(100)
summary(x)
```

State persists across blocks on the same page:

```r
mean(x) + 100
```

```r
dt <- data.table(g = rep(c("a", "b"), each = 5), v = 1:10)
dt[, .(mean = mean(v), n = .N), by = g]
```

```r
ggplot(data.frame(x = x), aes(x)) +
  geom_histogram(bins = 20, fill = "#284b63", colour = "white") +
  theme_minimal() +
  labs(title = "Histogram of x", x = NULL, y = "Count")
```

### What the Python equivalent looks like

The blocks below are **not** live on this page (this page is opted in to R). Paste them into any page that opens with `<script type="module" src="/static/js/code-runner.js" data-language="python"></script>` and they will run in the browser exactly as the R blocks above do. A working Python page is at [Runnable Python code blocks — live demo](/Notes/Code/Python/runnable-python-code-blocks-demo).

```python
import numpy as np
x = np.random.normal(size=100)
{"mean": float(x.mean()), "sd": float(x.std()), "min": float(x.min()), "max": float(x.max())}
```

```python
# State persists: `x` from the previous block is still in scope.
float(x.mean()) + 100
```

```python
import pandas as pd
df = pd.DataFrame({"g": ["a"] * 5 + ["b"] * 5, "v": range(1, 11)})
df.groupby("g").agg(mean=("v", "mean"), n=("v", "size"))
```

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.hist(x, bins=20, color="#284b63", edgecolor="white")
ax.set_title("Histogram of x")
ax.set_ylabel("Count")
fig  # having the figure as the last expression is optional; the runner picks up all open figures
```

## Why it is not trivial

WebR needs `SharedArrayBuffer`. Browsers only expose `SharedArrayBuffer` when the page is **cross-origin isolated**, which requires two HTTP response headers on every page:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

(The alternative `credentialless` value works in Chromium but is not yet supported in Firefox, so this setup uses `require-corp` for cross-browser compatibility. Under `require-corp`, cross-origin resources must additionally carry a `Cross-Origin-Resource-Policy` header — the service worker below injects that too.)

Pyodide does not *require* `SharedArrayBuffer` for its normal single-threaded operation, so a Python-only site could in principle skip the cross-origin isolation dance. This setup enables it unconditionally because (a) the same service worker helps every page whether R or Python, (b) it's needed for Pyodide's forthcoming/optional threading features, and (c) it's harmless when not needed.

GitHub Pages does not let you set custom HTTP headers. The standard workaround is a service worker that intercepts every fetch and re-adds the headers itself — the [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) pattern. A service worker only controls pages **at or below its own URL**, so the worker must be served from the site root (`/sw.js`), not from a subdirectory such as `/static/sw.js`.

Quartz's built-in `Static` emitter only copies files from `quartz/static/` into `public/static/`. There is no built-in way to write a file to the site root. That is why the solution below includes a small custom Quartz emitter.

## Architecture

```
+------------------------------------------------+
|  Visitor's browser                             |
|                                                |
|  1. Loads /Notes/.../my-page.html              |
|  2. Registers /sw.js                           |
|  3. Reloads once                               |
|  4. Every response now has COOP/COEP           |
|  5. crossOriginIsolated === true               |
|  6. code-runner.js reads data-language + data-packages
|     from its own <script> tag                  |
|  7. On first Run: dynamic import of the chosen |
|       backend (webr.js or pyodide.js)          |
|  8. Backend fetches its runtime + packages,    |
|       reports progress into the block's console|
|  9. Click Run -> evaluate code -> show output  |
|       (text + any bitmap plots)                |
+------------------------------------------------+
```

Opt-in is per page: adding a single `<script>` tag to a page enables the behaviour for that page's R **or** Python fenced code blocks (whichever language the tag names). Other pages are unaffected. One language per page.

## Files created

Four new files (the emitter, the shell, and one backend per language) and two small edits. All paths are relative to the Quartz project root. Each file is linked to its current version on GitHub — commented and complete.

### 1. `quartz/plugins/emitters/coiServiceWorker.ts` (new)

A small Quartz emitter plugin that writes a coi-serviceworker to the built site root as `sw.js`. This is the *only* way to serve a file at `/` scope from within Quartz.

The SW is **fully page-driven**: on every top-level HTML response, it peeks at the body for the exact `<script src="/static/js/code-runner.js" ...>` tag. If found, it adds COOP/COEP so the page becomes cross-origin isolated (needed by webR / Pyodide). If not, the response passes through untouched. Consequence: opting a page into runnable code is literally just adding the script tag — no allowlist, no config, no code to edit. Pages without the script tag are unaffected, so cross-origin iframes (Karakeep, YouTube, …), Google Fonts, and other cross-origin subresources across the rest of the site load normally.

**View source:** [coiServiceWorker.ts on GitHub](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/plugins/emitters/coiServiceWorker.ts)

### 2. `quartz/plugins/emitters/index.ts` (one-line edit)

Add the new emitter to Quartz's plugin exports:

```typescript
export { COIServiceWorker } from "./coiServiceWorker"
```

This is the only edit to a file Quartz "owns". On upgrade, resolve the trivial merge conflict by keeping this line.

**View source:** [emitters/index.ts on GitHub](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/plugins/emitters/index.ts)

### 3. `quartz.config.ts` (one-line edit)

Register the plugin alongside the other emitters:

```typescript
emitters: [
  // ...existing emitters...
  Plugin.CustomOgImages(),
  Plugin.COIServiceWorker(),
],
```

**View source:** [quartz.config.ts on GitHub](https://github.com/prcleary/prcleary.github.io/blob/main/quartz.config.ts)

### 4. `quartz/static/js/code-runner.js` + `backends/` (new)

The client-side runtime is split into a small **shell** and one **backend** per supported language. Adding a third language later (Julia via WebAssembly, WebAssembly-compiled SQLite, …) means dropping in one more file that implements the same interface.

- `quartz/static/js/code-runner.js` — reads the script tag's `data-language` and `data-packages` attributes, registers `/sw.js`, dynamically imports the requested backend on first Run, and augments every `<pre data-language="{lang}">` on the page with a **▶ Run** button + console + plot area. Also handles the single first-load reload so the COI headers take effect, and populates an optional `<pre id="code-runner-diag">` diagnostic panel.
- `quartz/static/js/backends/webr.js` — R backend (webR, `https://webr.r-wasm.org`). Installs the requested packages from `repo.r-wasm.org`, evaluates each block inside a webR `Shelter`, returns stdout/stderr and any captured graphics as `ImageBitmap`s.
- `quartz/static/js/backends/pyodide.js` — Python backend (Pyodide v0.27.7, `https://cdn.jsdelivr.net/pyodide/`). Installs packages via `pyodide.loadPackage` when they're in the pre-built repository, or falls back to `micropip.install(...)` from PyPI for pure-Python packages. Evaluates each block with `runPythonAsync` (so top-level `await` works), captures stdout and stderr via `pyodide.setStdout` / `setStderr`, and collects any open matplotlib figures via a small Python postlude that iterates `plt.get_fignums()` and `savefig()`s each figure to a PNG. Ships with two runtime-bootstrap strategies: the standard cross-origin `import()` of `pyodide.mjs`, and a same-origin bypass (`fetch` the runtime files as text, indirect-`eval` `pyodide.asm.js` to pre-install `_createPyodideModule`, then `import()` `pyodide.mjs` from a `blob:` URL) that transparently kicks in on browsers whose cross-origin dynamic-import path is broken under COOP/COEP require-corp — Firefox for Android in particular. Both strategies keep every subsequent asset (wasm, stdlib, lockfile, wheels) on jsDelivr; upgrading Pyodide is still a single-constant version bump.

All three JS files open with a plain-English "what this does and does not do" statement so you can read them on trust without being a JavaScript developer.

**View source:** [code-runner.js](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/static/js/code-runner.js) &middot; [backends/webr.js](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/static/js/backends/webr.js) &middot; [backends/pyodide.js](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/static/js/backends/pyodide.js) &middot; [raw served copy](/static/js/code-runner.js)

Backend defaults (used when `data-packages` is omitted):

| Backend | Default packages | Fallback for non-listed packages |
|---|---|---|
| R (webR) | `data.table`, `ggplot2` | none — user calls `webr::install()` in a block |
| Python (Pyodide) | `numpy`, `pandas`, `matplotlib` | `micropip.install(...)` from PyPI |

## How to use it in a post

Add a single script tag anywhere on the page. Set `data-language` to `r` or `python`, and optionally `data-packages` to a comma-separated list:

```markdown
<!-- R with the site's default packages (data.table + ggplot2) -->
<script type="module" src="/static/js/code-runner.js" data-language="r"></script>

<!-- R with a custom package list for this page -->
<script type="module" src="/static/js/code-runner.js"
        data-language="r"
        data-packages="data.table,ggplot2,dplyr,tidyr"></script>

<!-- Python with the site's default packages (numpy + pandas + matplotlib) -->
<script type="module" src="/static/js/code-runner.js" data-language="python"></script>

<!-- Python with a custom package list -->
<script type="module" src="/static/js/code-runner.js"
        data-language="python"
        data-packages="numpy,pandas,matplotlib,scikit-learn"></script>
```

One language per page. Then write ordinary R (```` ```r ````) or Python (```` ```python ````) fenced code blocks — the shell scans for `<pre data-language="{lang}">` matching the language you chose and adds a Run button to each. Blocks in any other language on the same page are left untouched.

Optionally add a diagnostic panel above your first block (useful while setting things up):

```markdown
<pre id="code-runner-diag"></pre>
```

## Design decisions and their rationale

**Per-page opt-in via a script tag.** Blocks that shouldn't be executable (code that references external files, connects to databases, or is only illustrative) stay static on pages that don't include the tag. No accidental "everything is live" behaviour on existing posts.

**One language per page.** Simpler mental model (state, plot rendering, package install) and simpler runtime: only one WebAssembly runtime is downloaded. Mixing R and Python cells on a single page adds complexity for very little gain — cross-language demos are rare, and when they do arise a Quartz page transclude / iframe between two dedicated pages is clearer.

**No editable widget.** An earlier prototype included a CodeMirror-backed textarea where visitors could type arbitrary code. Removed as unnecessary surface area — the sandboxing means arbitrary code cannot actually harm the visitor's machine, but the intent of these pages is to *demonstrate published examples*, not to be a general playground. If you want a playground, [webR's official REPL](https://webr.r-wasm.org/latest/) and [Pyodide's REPL](https://pyodide.org/en/stable/console.html) already exist.

**State persists within a page.** All blocks on the same page share one interpreter session, so a block can refer to objects defined earlier. This matches how someone would work through a tutorial. Different pages get fresh sessions. In R this is a shared webR instance; in Python it's `pyodide.globals` persisted across `runPythonAsync` calls.

**Packages pre-installed at first run, not per-block.** Trading a longer first-run wait (~15 s for the R defaults, ~20–30 s for the Python defaults) for a much better experience on every subsequent block. Both `data-packages` and the backend `defaultPackages` list are consumed once at first Run.

**Plots.** WebR gives us `Shelter.captureR({ captureGraphics: { width, height } })`, which returns rendered `ImageBitmap` objects. Pyodide has no direct equivalent; we force `matplotlib.use("Agg")` and after each block iterate `plt.get_fignums()` to `savefig()` each open figure to a PNG buffer, which is then decoded to an `ImageBitmap`. Either way the shell draws each `ImageBitmap` to a `<canvas>` below the console output. To the reader they look identical.

**Backend contract.** Each backend exports `{ language, displayName, requiresCOI, defaultPackages, init(packages, progressCb), run(code) → { text, images } }`. The shell knows nothing about R or Python specifically — adding a new language means writing one more backend file.

## Applications

### Epidemiology

**Interactive concept explainers.** Show sensitivity and specificity in an ROC curve where the reader can vary the cut-off. Illustrate confounding by re-running a simulation with different collider structures. Compare age-standardised vs crude rates on toy populations without asking the reader to install R or Python.

**Recreating published analyses.** Embed the R or Python code from a paper or field report alongside the writeup. Readers who want to poke at it can hit Run and get identical results in their browser — no environment setup, no reproducibility rot from missing package versions (webR uses a pinned r-wasm CRAN snapshot; Pyodide pins each release to specific package versions).

**Small, self-contained simulations.** Chain a few blocks: generate an outbreak, fit a compartmental model, plot the fit. Because state persists on the page, each step reads like a script and executes like one.

Example — a rough SIR simulation in R:

```r
sir <- function(beta, gamma, N, I0, days) {
  s <- N - I0; i <- I0; r <- 0
  out <- data.frame(t = 0, S = s, I = i, R = r)
  for (t in 1:days) {
    new_i <- beta * s * i / N
    new_r <- gamma * i
    s <- s - new_i
    i <- i + new_i - new_r
    r <- r + new_r
    out <- rbind(out, data.frame(t = t, S = s, I = i, R = r))
  }
  out
}
sim <- sir(beta = 0.4, gamma = 0.1, N = 1000, I0 = 1, days = 100)
head(sim)
```

```r
library(ggplot2)
ggplot(sim, aes(t)) +
  geom_line(aes(y = S, colour = "S")) +
  geom_line(aes(y = I, colour = "I")) +
  geom_line(aes(y = R, colour = "R")) +
  labs(x = "day", y = "count", colour = NULL) +
  theme_minimal()
```

The Python equivalent (static on this page; live on a Python-opted-in page):

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def sir(beta, gamma, N, I0, days):
    s, i, r = N - I0, I0, 0
    rows = [(0, s, i, r)]
    for t in range(1, days + 1):
        new_i = beta * s * i / N
        new_r = gamma * i
        s -= new_i
        i += new_i - new_r
        r += new_r
        rows.append((t, s, i, r))
    return pd.DataFrame(rows, columns=["t", "S", "I", "R"])

sim = sir(beta=0.4, gamma=0.1, N=1000, I0=1, days=100)
sim.head()
```

```python
fig, ax = plt.subplots()
for col in ("S", "I", "R"):
    ax.plot(sim["t"], sim[col], label=col)
ax.set_xlabel("day"); ax.set_ylabel("count")
ax.legend(); ax.set_title("SIR simulation")
fig
```

### Teaching R or Python coding

**Zero setup for learners.** The single biggest barrier to teaching either language is getting people past installing the interpreter, an IDE, and packages. A page with runnable blocks removes that barrier entirely for the first few hours of learning. Learners see code, run it, read output, edit their own local copy when they're ready.

**Live worked examples in course notes.** Turn static notes into a self-checking tutorial. Each concept has a runnable illustration. Learners predict the output, then click Run and compare.

**Comparing approaches.** Show three ways to do the same thing in R (base R, `data.table`, `dplyr`), or in Python (loops, NumPy vectorisation, pandas `groupby`), with runnable timings, and let the learner see the results for themselves rather than take the author's word.

Example — building intuition for the difference between mean and median (R, live above; Python static):

```python
import numpy as np
import matplotlib.pyplot as plt
rng = np.random.default_rng(0)
x = np.concatenate([rng.normal(50, 5, 100), [200, 250]])
{"mean": float(x.mean()), "median": float(np.median(x))}
```

```python
fig, ax = plt.subplots()
ax.hist(x, bins=30)
ax.axvline(x.mean(),        color="red",  lw=2, label="mean")
ax.axvline(float(np.median(x)), color="blue", lw=2, label="median")
ax.set_title("Two obvious outliers pull the mean, not the median")
ax.legend()
fig
```

## Limitations to be aware of

### Common to both languages

- **First-run cost.** The first click of any Run button downloads the language runtime plus the default packages. Expect 15–30 s for R (webR + `data.table` + `ggplot2`) and 60–120 s for Python (Pyodide + `numpy` + `pandas` + `matplotlib`, including matplotlib's font-cache warmup) on a decent connection. Subsequent runs on the same page load are near-instant.
- **Memory limits.** WebAssembly has a 4 GB memory ceiling per instance; in practice browsers cap this lower. Analyses on large datasets will not work.
- **No filesystem access to the visitor's machine.** Both runtimes use a sandboxed virtual filesystem. `readLines()` / `open()` inside a block sees only what the runtime has (essentially nothing sensitive). This is a feature — but it means you cannot read local files or write results the visitor can download without extra plumbing.
- **First page load reloads once.** The service worker registration triggers a single automatic reload the first time a visitor lands on any page with the runner. Subsequent visits (SW already installed) do not reload.
- **Navigation off a runnable page is a full reload.** Cross-origin-isolated capability sticks to the document it was loaded on. Quartz's SPA nav (`enableSPA`) keeps the same document across link clicks, which would leak the isolation to non-runnable pages and break their cross-origin iframes and fonts. So on runnable-code pages the client script intercepts link clicks and forces a full browser navigation. Visitors won't notice — pages load quickly — but under the hood you're doing a real reload rather than SPA content swap when leaving a runnable page.
- **Requires HTTPS.** Service workers only work on HTTPS or `localhost`. Not a real limitation for GitHub Pages, but worth knowing if you preview through some other host.

### Browser compatibility

Everything above (webR, Pyodide, matplotlib font-cache warmup, plot capture, cross-origin isolation, the SPA-nav workaround) uses only standards-track web features. All major browsers on desktop and mobile handle it identically:

| Browser | Runnable code | Cross-origin iframes elsewhere | Google Fonts |
|---|---|---|---|
| Chrome / Edge (Chromium, all platforms) | ✅ | ✅ | ✅ |
| Firefox (desktop + Android, normal + private) | ✅ | ✅ | ✅ |
| Safari (macOS 12+, iOS 16+) | ✅ | ✅ | ✅ |
| DuckDuckGo Browser | ❌ blocked by DDG's tracking protection | ⚠️ works on first tab visit; **fails after visiting a runnable page in the same tab** | ✅ |

DuckDuckGo Browser blocks `cdn.jsdelivr.net` (Pyodide), `webr.r-wasm.org` (webR), and `repo.r-wasm.org` (R packages) as third-party trackers. This is a browser-side policy that runs before any page-side code sees the request, so there is no site-side workaround.

The tab-poisoning behaviour is a specific side-effect: once the runtime download fails on a runnable page, the residual service worker + cross-origin isolation state seems to interact badly with DDG's tracker layer, and subsequent same-tab navigations to other pages on this site (e.g. Bookmarks with its embedded iframe) fail with *ERR_BLOCKED_BY_RESPONSE*. Opening a new tab clears the state; toggling Site Privacy Protection off in DDG avoids the problem entirely for that site.

### R-specific

- **Not all CRAN packages are available.** WebR ships pre-built binaries at `repo.r-wasm.org` for most common packages, but anything with unusual system dependencies may be missing. Check https://repo.r-wasm.org/ before designing a post around a specific package.
- **`htmlwidgets`-based interactive graphics do not render.** Packages such as `plotly`, `leaflet`, `DT`, `dygraphs`, `visNetwork` and similar produce an *htmlwidget* — an R object containing HTML markup and JavaScript that needs the corresponding widget library (plotly.js, Leaflet, DataTables, etc.) loaded on the page to actually draw anything. The runner captures only text output (stdout/stderr) and static bitmap plots from R's graphics devices. For interactive visualisations, use `ggplot2` with static output (fully supported), or generate the interactive HTML offline and embed it as a static file / iframe.

### Python-specific

- **Not all PyPI packages are available.** Pyodide ships pre-built binaries for the [~250-package Pyodide package repository](https://pyodide.org/en/stable/usage/packages-in-pyodide.html), which covers the scientific stack (numpy, scipy, pandas, matplotlib, scikit-learn, statsmodels, sympy, networkx, …). For anything else, `micropip.install(...)` from PyPI works — but *only* for pure-Python packages. Anything with a C extension not pre-compiled for WebAssembly (e.g. `psycopg2`, some cryptography wheels) will fail.
- **Interactive front-ends do not render.** Same story as R's htmlwidgets: `plotly`, `bokeh`, `altair`, `ipywidgets` and similar produce HTML/JS that needs their runtime loaded on the page. Use `matplotlib` (fully supported), or embed the interactive output as a pre-rendered static file / iframe.
- **matplotlib font cache warmup adds 30–90 s to the first Run** on any page whose package list includes `matplotlib`. Pyodide has no persistent filesystem across page loads, so `font_manager` rebuilds its cache from scratch every time. The runner triggers this during init (attributed to the visible "Warming up matplotlib font cache…" progress line) so the first plot renders immediately once init finishes.
- **`plt.show()` is a no-op.** With `matplotlib.use("Agg")` there is no window to show into. Any open figure is picked up automatically by the runner's postlude, so you don't need `plt.show()` — but leaving it in does no harm.
- **stdout / stderr are captured line-by-line.** Progress bars that use carriage returns (`\r`) to overwrite the same line will appear as many separate lines in the console output. Use `print(..., flush=True)` sparingly.

## Adding more packages

Three approaches, chosen per situation:

1. **Per-page in the script tag** (recommended): set `data-packages` on the opt-in tag. Installed and attached the first time any Run is clicked on the page. Overrides the backend default entirely.
   ```markdown
   <script type="module" src="/static/js/code-runner.js"
           data-language="r"
           data-packages="data.table,ggplot2,dplyr,tidyr"></script>

   <script type="module" src="/static/js/code-runner.js"
           data-language="python"
           data-packages="numpy,pandas,matplotlib,scikit-learn,statsmodels"></script>
   ```
2. **Site-wide default:** edit `defaultPackages` in [quartz/static/js/backends/webr.js](/static/js/backends/webr.js) or [quartz/static/js/backends/pyodide.js](/static/js/backends/pyodide.js). Used on any page whose script tag omits `data-packages`.
3. **Per-block inside the language:** call the language's own install machinery from any block.
   ```r
   webr::install(c("dplyr", "tidyr"))
   library(dplyr); library(tidyr)
   ```
   ```python
   import micropip
   await micropip.install(["requests"])   # pure-Python packages from PyPI
   import requests
   ```

## Debugging setup

If Run doesn't work, include the diagnostic panel:

```markdown
<pre id="code-runner-diag"></pre>
```

After the first-load reload, it should read (for an R page):

```
language: r
crossOriginIsolated: true
SharedArrayBuffer available: true
SW controller: https://YOURSITE.github.io/sw.js
```

For Python, `language: python` and the SharedArrayBuffer line is informational only (Pyodide works without it).

If `crossOriginIsolated: false` persists after a manual hard reload, the service worker is not intercepting requests. Check:

- `/sw.js` exists at the site root (open the URL directly)
- The `COIServiceWorker` plugin is registered in `quartz.config.ts`
- The page was loaded over HTTPS
- No other service worker on the site is claiming the root scope

## Acknowledgements

- [webR](https://docs.r-wasm.org/webr/latest/) — George Stagg and the r-wasm team. The R side of the heavy lifting is theirs.
- [Pyodide](https://pyodide.org/) — the Pyodide contributors (originally at Mozilla, now community-led). The Python side.
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) — Guido Zuidhof. The technique the emitter's SW is modelled on.
- [Quartz](https://quartz.jzhao.xyz/) — Jacky Zhao. Well-structured plugin system that made a 30-line custom emitter enough.

<script type="module" src="/static/js/code-runner.js" data-language="r"></script>

<style>
  .code-runner-inline { padding: 0.25rem 0; margin: -0.5rem 0 1rem; }
  .code-runner-inline button { font-size: 0.85em; padding: 0.15rem 0.6rem; cursor: pointer; }
  .code-runner-inline .code-runner-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; margin: 0.5rem 0 0; border-radius: 4px; font-size: 0.85em; }
  .code-runner-inline .code-runner-plot { margin: 0; }
</style>
