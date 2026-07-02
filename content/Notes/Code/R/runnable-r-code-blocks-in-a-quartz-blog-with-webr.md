---
title: Runnable R code blocks in a Quartz blog with webR
date: 2026-07-02
tags:
  - R
  - Quartz
  - WebAssembly
  - webR
  - epidemiology
  - teaching
author: GitHub Copilot
---

> This page was authored by GitHub Copilot (Claude Opus 4.7) as an AI pair-programmer, working with Paul Cleary to design, implement, and debug the solution described. It doubles as a live demonstration: every ```r block below has a Run button.

## What this gives you

Any ```r fenced code block on any Quartz page that opts in becomes runnable in the visitor's browser. R evaluates client-side via [webR](https://docs.r-wasm.org/webr/latest/) (an R interpreter compiled to WebAssembly). No server, no back end, no per-visitor cost. Packages such as `data.table` and `ggplot2` load automatically; plots render as canvas images below each block.

Try it — click Run below:

<pre id="webr-diag" style="background:var(--lightgray); padding:0.5rem; font-size:0.85em; border-radius:4px;"></pre>

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

## Why it is not trivial

WebR needs `SharedArrayBuffer`. Browsers only expose `SharedArrayBuffer` when the page is **cross-origin isolated**, which requires two HTTP response headers on every page:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

(The alternative `credentialless` value works in Chromium but is not yet supported in Firefox, so this setup uses `require-corp` for cross-browser compatibility. Under `require-corp`, cross-origin resources must additionally carry a `Cross-Origin-Resource-Policy` header — the service worker below injects that too.)

GitHub Pages does not let you set custom HTTP headers. The standard workaround is a service worker that intercepts every fetch and re-adds the headers itself — the [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) pattern. A service worker only controls pages **at or below its own URL**, so the worker must be served from the site root (`/sw.js`), not from a subdirectory such as `/static/sw.js`.

Quartz's built-in `Static` emitter only copies files from `quartz/static/` into `public/static/`. There is no built-in way to write a file to the site root. That is why the solution below includes a small custom Quartz emitter.

## Architecture

```
+-------------------------------------------+
|  Visitor's browser                        |
|                                           |
|  1. Loads /Notes/.../my-page.html         |
|  2. Registers /sw.js                      |
|  3. Reloads once                          |
|  4. Every response now has COOP/COEP      |
|  5. crossOriginIsolated === true          |
|  6. webR init succeeds                    |
|  7. Click Run -> evaluate R -> show output|
+-------------------------------------------+
```

Opt-in is per page: adding a single `<script>` tag to a page enables the behaviour for that page's ```r blocks. Other pages are unaffected.

## Files created

Four new files and two small edits. All paths are relative to the Quartz project root. Each file is linked to its current version on GitHub — commented and complete.

### 1. `quartz/plugins/emitters/coiServiceWorker.ts` (new)

A tiny Quartz emitter plugin (~35 lines) that writes a coi-serviceworker to the built site root as `sw.js`. This is the *only* way to serve a file at `/` scope from within Quartz.

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

### 4. `quartz/static/js/webr-runner.js` (new)

The client-side runtime. It:

1. Registers `/sw.js` on load and reloads the page once so the COI headers take effect.
2. Populates an optional `<pre id="webr-diag">` element with the current state (crossOriginIsolated, SharedArrayBuffer availability, active SW).
3. Lazily boots webR on the first Run click. Installs `data.table` and `ggplot2` from `repo.r-wasm.org` (pre-built WASM binaries — much faster than compiling) and attaches them.
4. Scans the page for every `<pre data-language="r">` (Quartz's rendered form of a ```r block) and appends a **▶ Run** button plus a console/plot area to each.
5. On Run, reads the block's text verbatim (no editing), evaluates it inside a webR `Shelter`, and displays streamed stdout/stderr and any captured graphics.
6. Re-scans on Quartz's SPA `nav` event so runners appear on client-side navigation too.

**View source:** [webr-runner.js on GitHub](https://github.com/prcleary/prcleary.github.io/blob/main/quartz/static/js/webr-runner.js) &middot; [raw served copy](/static/js/webr-runner.js)

The file opens with a plain-English "what this does and does not do" statement and a JavaScript-for-R-users glossary, so you can read it on trust without having to be a JavaScript developer.

Key configuration constant:

```javascript
const DEFAULT_PACKAGES = ["data.table", "ggplot2"];
```

Add or remove packages here; they'll be installed and attached the first time any Run is clicked on any page.

### 5. `.github/workflows/deploy.yml` (one-line edit)

Added `workflow_dispatch:` to the `on:` block so the workflow can be re-triggered manually from the Actions tab UI when a push-triggered run gets stuck (see Debugging setup below).

**View source:** [deploy.yml on GitHub](https://github.com/prcleary/prcleary.github.io/blob/main/.github/workflows/deploy.yml)

## How to use it in a post

Add a single script tag anywhere on the page:

```markdown
<script type="module" src="/static/js/webr-runner.js"></script>
```

Optionally add a diagnostic panel above your first block (useful while setting things up):

```markdown
<pre id="webr-diag"></pre>
```

Then just write ordinary ```r fenced blocks. Each one gets a Run button.

## Design decisions and their rationale

**Per-page opt-in via a script tag.** R blocks that shouldn't be executable (e.g. code that references external files, connects to databases, or is only illustrative) stay static on pages that don't include the tag. No accidental "everything is live" behaviour on your existing posts.

**No editable widget.** An earlier prototype included a CodeMirror-backed textarea where visitors could type arbitrary R. I removed it because it was unnecessary surface area — the sandboxing means arbitrary code cannot actually harm the visitor's machine, but the intent of these pages is to *demonstrate published examples*, not to be a general R playground. If you want a playground, [webR's official REPL](https://webr.r-wasm.org/latest/) already exists.

**State persists within a page.** All ```r blocks on the same page share one R session, so a block can refer to objects defined earlier. This matches how someone would work through a tutorial and lets you build up complexity across a post. Different pages get fresh sessions.

**Packages pre-installed at first run, not per-block.** Trading a longer first-run wait (~15–30 s to install `data.table` + `ggplot2` the first time) for a much better experience thereafter.

**Plots via `captureGraphics`.** WebR's `Shelter.captureR({ captureGraphics: { width, height } })` returns rendered `ImageBitmap` objects, which are drawn to a `<canvas>` below the console output. This avoids fiddly graphics-device wiring on the R side — plot code just works.

## Applications

### Epidemiology

**Interactive concept explainers.** Show sensitivity and specificity in an ROC curve where the reader can vary the cut-off. Illustrate confounding by re-running a simulation with different collider structures. Compare age-standardised vs crude rates on toy populations without asking the reader to install R.

**Recreating published analyses.** Embed the R code from a paper or field report alongside the writeup. Readers who want to poke at it can hit Run and get identical results in their browser — no environment setup, no reproducibility rot from missing package versions (webR uses a pinned r-wasm CRAN snapshot).

**Small, self-contained simulations.** Chain a few blocks: generate an outbreak, fit a compartmental model, plot the fit. Because state persists on the page, each step reads like a script and executes like one.

Example — a rough SIR simulation:

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

### Teaching R coding

**Zero setup for learners.** The single biggest barrier to teaching R is getting people past installing R, RStudio, and packages. A page with runnable blocks removes that barrier entirely for the first few hours of learning. Learners see code, run it, read output, edit their own local copy when they're ready.

**Live worked examples in course notes.** Turn static notes into a self-checking tutorial. Each concept has a runnable illustration. Learners predict the output, then click Run and compare.

**Comparing approaches.** Show three ways to do the same thing (base R, `data.table`, `dplyr`) with runnable timings, and let the learner see the results for themselves rather than take the author's word.

Example — building intuition for the difference between mean and median:

```r
x <- c(rnorm(100, mean = 50, sd = 5), 200, 250)
c(mean = mean(x), median = median(x))
```

```r
hist(x, breaks = 30, main = "Two obvious outliers pull the mean, not the median")
abline(v = mean(x),   col = "red",  lwd = 2)
abline(v = median(x), col = "blue", lwd = 2)
legend("topright", c("mean", "median"), col = c("red","blue"), lwd = 2)
```

## Limitations to be aware of

- **First-run cost.** The first click of any Run button downloads webR (a few MB) plus the default packages. Expect 15–30 s on a decent connection. Subsequent runs on the same page load are near-instant.
- **Not all CRAN packages are available.** WebR ships pre-built binaries at `repo.r-wasm.org` for most common packages, but anything with unusual system dependencies may be missing. Check https://repo.r-wasm.org/ before designing a post around a specific package.
- **Memory limits.** WebAssembly has a 4 GB memory ceiling per instance; in practice browsers cap this lower. Analyses on large datasets will not work.
- **No filesystem access to the visitor's machine.** WebR runs in a WASM sandbox with its own virtual filesystem. `readLines("/etc/passwd")` inside a block sees only what webR has (essentially nothing sensitive). This is a feature, not a limitation — but it means you cannot read local files or write results the visitor can download without extra plumbing.
- **First page load reloads once.** The service worker registration triggers a single automatic reload the first time a visitor lands on any page with the runner. Subsequent visits (SW already installed) do not reload.
- **Requires HTTPS.** Service workers only work on HTTPS or `localhost`. Not a real limitation for GitHub Pages, but worth knowing if you preview through some other host.

## Adding more packages

Three approaches, chosen per situation:

1. **Site-wide default:** edit `DEFAULT_PACKAGES` in [quartz/static/js/webr-runner.js](/static/js/webr-runner.js). Installed on first Run on every runnable page.
2. **Per-page:** make the first ```r block do the install. Every subsequent block on the page can use it.
   ```r
   webr::install(c("dplyr", "tidyr"))
   library(dplyr); library(tidyr)
   ```
3. **Per-block:** inline `webr::install()` inside the block that needs it.

## Debugging setup

If you add the ```r blocks and Run doesn't work, include the diagnostic panel:

```markdown
<pre id="webr-diag"></pre>
```

After the first-load reload, it should read:

```
crossOriginIsolated: true
SharedArrayBuffer available: true
SW controller: https://YOURSITE.github.io/sw.js
```

If `crossOriginIsolated: false` persists after a manual hard reload, the service worker is not intercepting requests. Check:

- `/sw.js` exists at the site root (open the URL directly)
- The `COIServiceWorker` plugin is registered in `quartz.config.ts`
- The page was loaded over HTTPS
- No other service worker on the site is claiming the root scope

## Acknowledgements

- [webR](https://docs.r-wasm.org/webr/latest/) — George Stagg and the r-wasm team. The heavy lifting is theirs.
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) — Guido Zuidhof. The technique the emitter's SW is modelled on.
- [Quartz](https://quartz.jzhao.xyz/) — Jacky Zhao. Well-structured plugin system that made a 30-line custom emitter enough.

<script type="module" src="/static/js/webr-runner.js"></script>

<style>
  .r-runner-inline { padding: 0.25rem 0; margin: -0.5rem 0 1rem; }
  .r-runner-inline button { font-size: 0.85em; padding: 0.15rem 0.6rem; cursor: pointer; }
  .r-runner-inline .r-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; margin: 0.5rem 0 0; border-radius: 4px; font-size: 0.85em; }
  .r-runner-inline .r-plot { margin: 0; }
</style>
