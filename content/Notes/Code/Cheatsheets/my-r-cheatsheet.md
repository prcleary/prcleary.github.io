---
id: 20230315120000
title: "My R cheatsheet"
aliases:
  - "R cheatsheet"
  - "R command reference"
type: cheatsheet
category: tech
subcategory: r
domain: tools
tags:
  - r
  - data-analysis
  - cheatsheet
created: 2023-03-15
modified: 2026-05-23
date: 2023-03-15
status: active
up: "[[R]]"
---

# My R cheatsheet

> [!quote]
> Stuff I find myself Googling for the *n*th time.

> [!note] Scope
> This is base R + `data.table`-flavoured. A few entries have tidyverse equivalents (noted inline) but the canonical form here is whatever I actually reach for.

## Metaprogramming

### Get the name of a variable within a function

```r
deparse(substitute(x))
```

Useful for diagnostic messages (`"x must be numeric"`) where you want the *caller's* name for the argument, not the literal string `"x"`.

Tidyverse equivalent: `rlang::ensym(x)` returns a symbol; `rlang::as_label(rlang::enquo(x))` returns a string. Use these inside `{rlang}`-aware functions; stick with `deparse(substitute())` for plain base R.

## Strings & formatting

### Pad numbers with leading zeroes

```r
formatC(1:10, width = 3, flag = '0')
# "001" "002" ... "010"
```

Equivalent alternatives, in rough order of how often I reach for them:

```r
sprintf("%03d", 1:10)              # base R, arguably more idiomatic
stringr::str_pad(1:10, 3, pad = '0')  # tidyverse
formatC(1:10, width = 3, flag = '0')  # what's documented above
```

### Strip non-word characters from text

```r
x <- '  abc <>?|!"£$%^&*()_+}{~@:¬}"  def  123'
gsub('\\W+', '', x)
# "abc_def123"
```

> [!warning] `\W` keeps underscores
> `\W` matches *non-word* characters, where "word character" = `[A-Za-z0-9_]`. So underscores survive (visible in the output above). If you want strictly alphanumeric, use `gsub('[^A-Za-z0-9]+', '', x)` instead.

## Factors & modelling

### Set the reference level of a factor

```r
# data.table syntax:
thedata[, newvar := relevel(factor(oldvar), 'Reference level here')]

# Equivalent base R:
thedata$newvar <- relevel(factor(thedata$oldvar), ref = 'Reference level here')

# forcats equivalent:
thedata$newvar <- forcats::fct_relevel(factor(thedata$oldvar), 'Reference level here')
```

### Set contrasts globally

```r
options(contrasts = rep('contr.treatment', 2))
```

The two elements of the vector apply to **unordered** and **ordered** factors respectively. R's default is `c("contr.treatment", "contr.poly")` — i.e. polynomial contrasts for ordered factors, which can produce surprising regression coefficients if you weren't expecting them. Setting both to treatment contrasts gives uniform "this level vs. reference" coefficients regardless of factor ordering.

> [!tip] Set this at the top of analysis scripts
> Setting it inside a function won't persist past the function's exit unless you wrap it with `on.exit()`. For reproducibility, set globally near the script header, alongside `set.seed()`.

---

## LINKS

### Up
- [[R]] *(to write)*

### Related
- [[data.table cheatsheet]] *(to write)*
- [[Linear models in R]] *(to write)*
- [[Reproducibility in R]] *(to write)* — overlap on `options()`, `set.seed()`, session info
