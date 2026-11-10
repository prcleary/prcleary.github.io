---
title: Simple frequency table with data.table
date: 2023-11-27
tags:
  - R
  - Snippet
---


``` r
# Simple frequency table
freq_tab <- function(DT, varname, sort_pct = TRUE) {
  varname <- deparse(substitute(varname))
  result <-
    DT[, .(Number = .N),
			by = .(Variable = get(varname))][,
				`%` := round(100 * Number/sum(Number),
					1)]
  setnames(result, 'Variable', varname)
  if (sort_pct) {
    knitr::kable(result[order(-`%`)])
  } else {
    knitr::kable(result)
  }
}
# Example usage
mydatatable |>
  freq_tab(age_group)
```


