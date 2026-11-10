---
title: Aggregate data on time
date: 2022-11-08
tags:
  - R
  - Snippet
  - data.table
---


Typically what I use for aggregating dates for `ggplot2` plots - convert date (or POSIX etc) to first day of week

```r
periodise_date <- function(x, period = 'weeks') {
  as.Date(cut.Date(as.Date(x), period))
}
```

Outline of usage:

```r
overall_trend_data <-
  dat[, .(Cases = .N),
      .(Week = periodise_date(`Notification date`))]
ggplot(overall_trend_data, aes(x = Week, y = Cases)) +
  geom_bar(stat = 'identity') +
	labs(x = 'Notification (week beginning)')
```
