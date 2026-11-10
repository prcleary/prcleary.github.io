---
title: My ggplot2 cheatsheet
date: 2023-08-24
tags:
  - R
  - Cheatsheet
  - ggplot2
---

### Presenting monthly data without tears

```r
library(data.table)
library(ggplot2)
library(lubridate)

# Dummy data
n <- sample(10:100, 1)
sample_dates <- Sys.Date() - sample(1:1000, n)
years <- year(sample_dates)
months <- month(sample_dates, label = TRUE)
dummy_data <-
  unique(data.table(years, months))[order(years, months)]
dummy_data[, counts := rpois(nrow(dummy_data),
                             lambda = sample(1:50, 1))]

# Create date variable for start of month
# (can do same for first day of week)
dummy_data[, plotdate := make_date(years, months, 1)]
dummy_data

# Plot counts
ggplot(dummy_data,
       aes(x = plotdate, y = counts)) +
  geom_bar(stat = 'identity', fill = '#bf253d') +
  geom_text(
    aes(y = counts, label = counts),
    position = position_stack(vjust = 0.8),
    colour = '#ffffff',
    size = 3
  ) +
  # avoid non-integers in y axis
  scale_y_continuous(label = ~ scales::comma(.x, accuracy = 1)) +
  scale_x_date(
    breaks = 'months',
		minor_breaks = 'months',
    date_labels = '%Y %b',
    expand = c(0, 0)
  ) +
  labs(
    x = 'Month',
    y = 'Count',
    title = 'Dummy random time series',
    subtitle = 'Subtitle goes here',
    caption = 'Add notes here'
  ) +
  theme_minimal() +
	# also like theme_fivethirtyeight (ggthemes package)
  theme(axis.text.x = element_text(angle = 90, vjust = 0.5))

```
### Want to log transform but have zeroes?

```r
...
    scale_y_continuous(trans=scales::pseudo_log_trans(base = 10))
...
```
### Single horizontal legend at top

```r
...
    theme(legend.position = 'top') +
    guides(fill = guide_legend(nrow = 1))
...
```

### Vertical, aligned x axis labels

```r
...
        axis.text.x = element_text(angle = 90, vjust = 0.5))
...
```

### Wrap and rotate strip text in facetted plot

```r
...
	facet_grid(x ~ y, labeller = label_wrap_gen(10)) +
...
	theme(strip.text.y = element_text(angle = 0))
```

### Left justify captions

```r
...
	theme(plot.caption = element_text(hjust = 0))
```

Manually insert a `\n` to break a caption - not found a more elegant way

### Colour palette with more categories

```r
  scale_fill_brewer(palette = 'Paired')
```

### Legend at bottom

```r
  theme(legend.position = 'bottom')
```

