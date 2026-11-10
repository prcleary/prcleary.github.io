---
title: Plotly stacked bar chart that works better for hiding categories
date: 2022-11-03
tags:
  - R
  - Snippet
  - Plotly
---

`ggplotly` in the `plotly` package is a good quick way of making `ggplot2` charts interactive. But if you use it for stacked bar charts then clicking items in the legend to hide categories does not give the expected result (try it with p1 below) - however it does work with the plotly R package code (see p2).

```r
# ggplotly_hidecategories.R

library(data.table)
library(ggplot2)
library(plotly)

dates <- Sys.Date() - sample(1:10, 100, replace = TRUE)
categories <- sample(letters[1:3], 100, replace = TRUE)
DT <- data.table(dates, categories)

# Does not refresh
p1 <- ggplot(DT, aes(x = dates, fill = categories)) +
  geom_bar()
ggplotly(p1)

# Does refresh
# Requires aggregation of data
DT2 <- DT[, .N, .(dates, categories)]
p2 <-
  plot_ly(
    DT2,
    x = ~ dates,
    y = ~ N,
    split = ~ categories,
    type = 'bar'
  ) %>% layout(barmode = "stack")
p2
```

