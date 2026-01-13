+++
title = "Function to aggregate counts by ISO week from dates, without gaps"
+++


```r
agg_fill_isoweek <- function(datevar,
                             isoweekfmt = NULL,
                             pad = 0) {
  DT <- data.table::data.table(datevar)
  DT[, isoyr := lubridate::isoyear(datevar)]
  DT[, isowk := lubridate::isoweek(datevar)]
  DT_agg <- DT[, .N, .(isoyr, isowk)][order(isoyr, isowk)]
  all_dates <-
    DT[, seq(
      from = min(datevar, na.rm = TRUE) - pad,
      to = max(datevar, na.rm = TRUE) + pad,
      by = 1
    )]
  all_iso <-
    unique(data.table::data.table(
      isoyr = lubridate::isoyear(all_dates),
      isowk = lubridate::isoweek(all_dates)
    ))
  DT_agg_fill <- DT_agg[all_iso, on = names(all_iso)]
  DT_agg_fill[is.na(N), N := 0]
  if (is.null(isoweekfmt)) {
    DT_agg_fill[]
  } else {
    DT_agg_fill[, .(isoyrwk = sprintf(isoweekfmt, isoyr, isowk), N)]
  }
}
```

