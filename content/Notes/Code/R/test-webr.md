---
title: Test webR
date: 2026-07-02
---

Every ```r block on this page has a Run button. `data.table` and `ggplot2` are pre-loaded. State persists across the runs on this page.

<pre id="webr-diag" style="background:#eef; padding:0.5rem; font-size:0.85em;"></pre>

## Basic summary

```r
x <- rnorm(100)
summary(x)
```

## Reusing state — no need to redefine x

```r
mean(x) + 100
```

## data.table

```r
dt <- data.table(g = rep(c("a", "b"), each = 5), v = 1:10)
dt[, .(mean = mean(v), n = .N), by = g]
```

## ggplot2

```r
ggplot(data.frame(x = x), aes(x)) +
  geom_histogram(bins = 20, fill = "#284b63", colour = "white") +
  theme_minimal() +
  labs(title = "Histogram of x", x = NULL, y = "Count")
```

<script type="module" src="/static/js/webr-runner.js"></script>

<style>
  .r-runner-inline { padding: 0.25rem 0; margin: -0.5rem 0 1rem; }
  .r-runner-inline button { font-size: 0.85em; padding: 0.15rem 0.6rem; cursor: pointer; }
  .r-runner-inline .r-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; margin: 0.5rem 0 0; border-radius: 4px; font-size: 0.85em; }
  .r-runner-inline .r-plot { margin: 0; }
</style>


