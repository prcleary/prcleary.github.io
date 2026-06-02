---
title: My data.table cheatsheet
date: 2023-01-25
tags:
  - R
  - Cheatsheet
  - data.table
---

### Inner join

Join data where records present in both data sets

![Inner join](https://www.w3schools.com/sql/img_innerjoin.gif)

```r
alldata <-
	table2[table1, on = c(table2linkvar = 'table1linkvar'),
		nomatch = NULL]
```

Leave out the `nomatch` argument) and you get a **left [outer] join** of `table2` on `table1`.

![Left join](https://www.w3schools.com/sql/img_leftjoin.gif)

The ordering in the code is a bit counterintuitive.

### Apply a function to multiple columns in place

e.g. replace all missing/blank values with zero

```r
numdenom <- c('varname1', 'varname2')
alldata[, eval(numdenom) := lapply(.SD,
	function(x)
	  # the function
		ifelse(is.na(x) | x %in% '', 0, as.integer(x))
	),
		.SDcols = numdenom]
```

