---
title: "Run Shiny app from Windows batch file: example"
date: 2025-01-13
---

Create `planner.bat` (not `planner.bat.txt`!)

```
@echo off

"C:\Program Files\R\R-4.5.2\bin\Rscript.exe" --vanilla -e ^
"options(shiny.launch.browser = utils::browseURL); paulmisc::run_app('planner')"
```
