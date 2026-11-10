---
title: Read Stata labels in R
date: 2022-10-26
tags:
  - R
  - Snippet
---

This is a function to read Stata labels from data imported by `haven`.

It returns a data.table if `return.data.table=TRUE` and a data.frame if
`return.data.table=FALSE`.

``` r
withstatalabels <- function(dt, return.data.table = FALSE) {
  if (!require(data.table) | !require(haven))
    stop('`withstatalabels` requires `data.table` and `haven` packages')
  dt <- data.table(dt)
  dtclass <- sapply(dt, class)
  dtlabelled <-
    names(dt)[sapply(dtclass, function(x)
      'haven_labelled' %in% x)]
  dt[, (dtlabelled) := lapply(.SD, as_factor),
     .SDcols = dtlabelled]
  if (!return.data.table)
    as.data.frame(dt)
  else
    dt[]
}
```

