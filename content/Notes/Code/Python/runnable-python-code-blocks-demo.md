---
title: Runnable Python code blocks — live demo
date: 2026-07-03
tags:
  - Python
  - Quartz
  - WebAssembly
  - Pyodide
  - teaching
author: GitHub Copilot
---

> Companion to [Runnable R and Python code blocks in a Quartz blog](/Notes/Code/R/runnable-r-and-python-code-blocks-in-a-quartz-blog). That page is opted in to R and the Python examples there are static; this page is opted in to Python so every Python code block below is live — click **▶ Run** to execute it in your browser.

<pre id="code-runner-diag" style="background:var(--lightgray); padding:0.5rem; font-size:0.85em; border-radius:4px;"></pre>

Python evaluates entirely client-side via [Pyodide](https://pyodide.org/) — CPython 3.12 compiled to WebAssembly. The first Run downloads Pyodide and the default packages (`numpy`, `pandas`, `matplotlib`) and then warms up matplotlib's font cache; expect a wait of roughly **30–90 seconds** on that first click. Subsequent runs on the same page load are near-instant. State persists across every block on this page, so later blocks can use variables defined earlier.

> [!note] DuckDuckGo Browser users
> DuckDuckGo Browser's tracker blocking prevents Pyodide from downloading (its runtime is served from `cdn.jsdelivr.net`, which DDG blocks as a third party). If the Run buttons hang or nothing happens, tap the shield icon in the address bar and turn Site Privacy Protection off for this site. Every other major browser (Chrome, Firefox, Safari, Edge, on desktop and mobile) works out of the box.

As in an interactive Python REPL or a Jupyter cell, a bare expression on the last line of a block is auto-printed — you don't need to wrap it in `print(...)`. So `df.head()` or `{"mean": x.mean()}` at the end of a block will show its `repr()` in the console. Assignments and other statements produce no text output by themselves (again, exactly as in a REPL).

## A first run

```python
import sys, platform
{"python": sys.version.split()[0], "platform": platform.platform()}
```

## NumPy

```python
import numpy as np
x = np.random.default_rng(0).normal(size=100)
{"mean": float(x.mean()), "sd": float(x.std()), "min": float(x.min()), "max": float(x.max())}
```

State persists — `x` from the previous block is still in scope:

```python
float(x.mean()) + 100
```

## pandas

```python
import pandas as pd
df = pd.DataFrame({"g": ["a"] * 5 + ["b"] * 5, "v": range(1, 11)})
df.groupby("g").agg(mean=("v", "mean"), n=("v", "size"))
```

## matplotlib

Any figure left open when the block finishes is picked up automatically and drawn below the console.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.hist(x, bins=20, color="#284b63", edgecolor="white")
ax.set_title("Histogram of x")
ax.set_ylabel("Count")
fig
```

Two figures in one block — both are captured:

```python
fig1, ax1 = plt.subplots()
ax1.plot(np.cumsum(x))
ax1.set_title("Cumulative sum of x")

fig2, ax2 = plt.subplots()
ax2.boxplot(x, vert=False)
ax2.set_title("Boxplot of x")

None  # last expression is None so no scalar is printed
```

## A small self-contained simulation

An SIR outbreak, its data frame, and its plot — one language, three blocks that build on each other:

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
sim.describe()
```

```python
fig, ax = plt.subplots()
for col in ("S", "I", "R"):
    ax.plot(sim["t"], sim[col], label=col)
ax.set_xlabel("day"); ax.set_ylabel("count")
ax.legend(); ax.set_title("SIR simulation")
fig
```

## Installing extra packages

Two ways to add packages beyond the page defaults.

**Per-page in the script tag** (recommended):

```markdown
<script type="module" src="/static/js/code-runner.js"
        data-language="python"
        data-packages="numpy,pandas,matplotlib,scikit-learn,statsmodels"></script>
```

**Per-block with `micropip`** for pure-Python PyPI packages not in the Pyodide repository:

```python
import micropip
await micropip.install(["python-slugify"])
from slugify import slugify
slugify("Hello, World!")
```

`micropip.install` will fail for packages that contain compiled C extensions unless those extensions have been pre-built for WebAssembly. For those, use packages already in [Pyodide's built-in package list](https://pyodide.org/en/stable/usage/packages-in-pyodide.html), or find a pure-Python alternative.

## Errors surface naturally

Python errors show up in the console output with the usual traceback:

```python
def divide(a, b):
    return a / b

divide(1, 0)
```

## See also

- [Runnable R and Python code blocks in a Quartz blog](/Notes/Code/R/runnable-r-and-python-code-blocks-in-a-quartz-blog) — the technical write-up and R live demo.
- [Pyodide documentation](https://pyodide.org/en/stable/) — the runtime that makes this page work.
- [Pyodide's pre-built package list](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) — check here before designing a page around a specific dependency.

<script type="module" src="/static/js/code-runner.js" data-language="python"></script>

<style>
  .code-runner-inline { padding: 0.25rem 0; margin: -0.5rem 0 1rem; }
  .code-runner-inline button { font-size: 0.85em; padding: 0.15rem 0.6rem; cursor: pointer; }
  .code-runner-inline .code-runner-console { background: #111; color: #eee; padding: 0.5rem; min-height: 2em; white-space: pre-wrap; margin: 0.5rem 0 0; border-radius: 4px; font-size: 0.85em; }
  .code-runner-inline .code-runner-plot { margin: 0; }
</style>
