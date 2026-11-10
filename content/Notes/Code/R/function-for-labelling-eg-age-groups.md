---
title: "Function for labelling e.g. age groups"
date: 2023-03-21
tags:
  - R
  - Snippet
---

```r
#' Make Labels for `cut` Function
#'
#' @param x Breaks to use (including lowest and highest possible values)
#' @param units Units to be suffixed to labels (e.g. ' years')
#' @param min.label Replacement text for lowest label
#' @param max.label Replacement text for highest label
#'
#' @return Character vector of labels
#' @export
#'
#' @examples
#' age <- sample(0:110, 1000, replace = TRUE)
#' age_breaks <- c(0, 1, 5, seq(10, 100, 10), 1000)
#' age_group <- cut(
#'   age,
#'   breaks = age_breaks,
#'   labels = make_cut_labels(
#'     age_breaks,
#'     units = ' years',
#'     min.label = '<1',
#'     max.label = '100+'
#'   ),
#'   right = FALSE
#' )
#' age_group
make_cut_labels <-
  function(x,
           units = NULL,
           min.label = NULL,
           max.label = NULL) {
    breaks_for_labels <- x[-length(x)]
    labels <- paste0(breaks_for_labels,
                     '-',
                     breaks_for_labels +
                       c(diff(breaks_for_labels), 10) - 1)
    if (!is.null(min.label))
      labels[1] <- min.label
    if (!is.null(max.label))
      labels[length(labels)] <- max.label
    if (!is.null(units))
      labels <- paste0(labels, units)
    labels
  }
```

