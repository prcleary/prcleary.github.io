---
title: Quick summary of a variable
date: 2022-11-08
tags:
  - R
  - Snippet
---

```r
describe_variable <- function(x) {
  varname <- deparse(substitute(x))
  vartype <- class(x)
  varmissing <- sum(is.na(x))
  vartop20 <-
    paste0(names(sort(table(x), decreasing = TRUE))[1:20], collapse = ', ')
  cat(
    'Name:',
    varname,
    '| Type:',
    vartype,
    '| Missing:',
    varmissing,
    '| Top 20:',
    vartop20,
    '\n'
  )
}
```

