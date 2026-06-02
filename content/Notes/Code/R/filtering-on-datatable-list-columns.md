---
title: Filtering on data.table list columns
date: 2022-11-08
tags:
  - R
  - Snippet
  - data.table
---

If you have a field ("fieldname") containing concatenated text (e.g. "value1, value2, value 3, value 4") then you can split it into a `data.table` list column and then filter by text pattern/regular expression.
```r
dat[!grepl(
  'value1|value2',
  strsplit(fieldname, split = ', ')
)
```

