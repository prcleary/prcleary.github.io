---
title: Calculating directly standardised rates with data for only some age groups
date: 2022-11-15
tags:
  - R
  - Snippet
---

```r
library(data.table)
dummydata <- data.table(
  agegroup = c(
    '15 to 17',
    '18 to 24',
    '25 to 29',
    '30 to 34',
    '35 to 39',
    '40 to 44',
    '45 to 49',
    '50 to 54',
    '55 to 59',
    '60 to 64',
    '65 to 69'
  ),
  actualpopulation = rpois(11, 1000),
  standardpopulation = rep(10000, 11),
  cases = c(rpois(11, 20))
)

dummydata |> knitr::kable()

# Non-standardised rate
dummydata[, 100000 * sum(cases) / sum(actualpopulation)]

# Calculate age-specific rates
dummydata[, rate := cases / actualpopulation]

# Calculate expected cases in standard population
dummydata[, expectedcases := rate * standardpopulation]

# Calculate DSR per 100k
dummydata[, 100000 * sum(expectedcases) / sum(standardpopulation)]

dummydata |> knitr::kable()
```

