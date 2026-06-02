---
title: Melting questionnaire data with data.table
date: 2022-10-28
tags:
  - R
  - data.table
  - Snippet
---


```r
# Preps data for tables and charts
mytable2 <- function(dat, varsused, groupingvar = NULL) {
  if (!is.null(groupingvar)) {
    allvars <- c(groupingvar, varsused)
    melted <-
      melt(dat[, ..allvars], measure.vars = varsused)
    long <- melted[, .N, names(melted)]
    long[, pct_na := 100 * N / sum(N), c(groupingvar, 'variable')]
    long[!is.na(value), pct_nona := 100 * N / sum(N), c(groupingvar, 'variable')]
  } else {
    melted <-
      melt(dat[, ..varsused], measure.vars = varsused)
    long <- melted[, .N, .(variable, value)]
    long[, `pct_na` := round(100 * N / sum(N), 1), variable]
    long[!is.na(value), `pct_nona` := round(100 * N / sum(N), 1), variable]
  }
  long[, celltext_na := paste0(N, ' (', trimws(format(round(pct_na, 1), nsmall = 1)), '%)')]
  long[!is.na(value), celltext_nona := paste0(N, ' (', trimws(format(round(pct_nona, 1), nsmall = 1)), '%)')]
  long[]
}
# Usage
mydatatable |>
  mytable2(c('Q1', 'Q2', 'Q3'), 'role')
```

Note a way of always presenting numbers with given decimal places (here 1): `trimws(format(round(pct_na, 1), nsmall = 1))`

