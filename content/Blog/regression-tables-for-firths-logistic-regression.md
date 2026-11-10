---
title: Regression tables for Firth's logistic regression
date: 2022-12-06
tag:
  - Statistics
  - R
---

Here is an example of a function to produce simple regression tables for Firth's logistic regression models. It includes the estimates (exponentiated to odds ratios by default), plus 95% confidence intervals and the p values from the penalised likelihood ratio tests. You can tweak the rounding and output as Markdown if desired. It can't handle functions in the model formula (e.g. `+ factor(sex) +`) but you can usually do that sort of thing outside the model call. Example table beneath the code.

```r
library(data.table)
library(epiDisplay)  # for Oswego outbreak data set
library(knitr)
library(logistf)

data(Oswego)
setDT(Oswego)

options(scipen = 6)  # avoid scientific notation for small numbers
options(knitr.kable.NA = '')  # avoid NA's appearing in tables

# Add another level to sex and set "M" as the referent
Oswego[sample(nrow(Oswego), 10), sex := 'Other']
Oswego[, sex := relevel(factor(sex), ref = 'M')]

# Fit a model
model_firth <-
  logistf(ill ~ vanilla + bakedham + spinach + sex, data = Oswego)

# Create a function to produce regression table
logistf_table <- function(logistf_model,
                          exponentiate = TRUE,
                          rounding = 2,
                          p.val.digits = 3,
                          md = FALSE) {
  # Get the coefficients
  model_coef <-
    coef(logistf_model) |> as.data.table(keep.rownames = TRUE)
  # Get the confidence intervals
  model_confint <-
    confint(logistf_model) |> as.data.table(keep.rownames = TRUE)
  # Join the coeffients to the confidence intervals (easy)
  model_coef_confint <- model_confint[model_coef, on = c(rn = 'V1')]
  # Get the penalised LRT p values
  model_lrt <-
    drop1(logistf_model) |> as.data.table(keep.rownames = TRUE)
  # Join it all together (difficult)
  # Find the matches
  matches <-
    sapply(model_lrt$rn, function(x)
      grep(paste0('^', x), model_coef_confint$rn, value = TRUE),
      simplify = FALSE,
      USE.NAMES = TRUE)
  # Add the matches to a list column
  model_lrt[, matches := matches[rn]]
  # Expand the list column
  model_lrt <-
    model_lrt[, unlist(matches), .(rn, ChiSq, df, `P-value`)]
  # Join it all up now we have a common field
  final_table <- model_lrt[model_coef_confint, on = c(V1 = 'rn')]
  # Remove variable names from coefficient names
  final_table[, V1 := gsub(paste0('^', rn), '', V1), by = 1:nrow(final_table)]
  # Remove duplicate presentation of p values and variable names
  final_table[duplicated(rn), `:=`(
    `P-value` = NA,
    df = NA,
    ChiSq = NA,
    rn = NA
  )]
  # Tidy up table
  final_table <- final_table[, .(
    variable = rn,
    value = V1,
    estimate = V2,
    `Lower 95%`,
    `Upper 95%`,
    ChiSq,
    df,
    P.value = format.pval(`P-value`, p.val.digits)
  )]
  # Exponentiate to odds ratios by default
  if (exponentiate) {
    final_table[,
                `:=`(
                  estimate = exp(estimate),
                  `Lower 95%` = exp(`Lower 95%`),
                  `Upper 95%` = exp(`Upper 95%`)
                )]
  }
  # Round to 2 by default
  if (!is.null(rounding)) {
    final_table[,
                `:=`(
                  estimate = round(estimate, rounding),
                  `Lower 95%` = round(`Lower 95%`, rounding),
                  `Upper 95%` = round(`Upper 95%`, rounding)
                )]
  }
  # Output as Markdown if required
  if (md) {
    kable(final_table)
  } else {
    final_table[]
  }
}

# Run the function
logistf_table(model_firth)
# Presents variables in same order provided to original model formula
# NB: this can't handle terms in the model formula such as " + factor(sex) + "
# so do this outside the model formula

# Change rounding
logistf_table(model_firth, rounding = 1, p.val.digits = 2)
# Check out the pval_string function in the pixiedust package for more control on p value presentation

# Or output as Markdown
logistf_table(
  model_firth,
  rounding = 2,
  p.val.digits = 3,
  md = TRUE
)

# Now works also with one predictor models! (thanks Jo!)
model_firth2 <-
  logistf(ill ~ sex, data = Oswego)
logistf_table(model_firth2)

# Multiple one predictor models
xvars <-
  c(
    'sex',
    'bakedham',
    'spinach',
    'mashedpota',
    'cabbagesal',
    'jello',
    'rolls',
    'brownbread',
    'milk',
    'coffee',
    'water',
    'cakes',
    'vanilla',
    'chocolate',
    'fruitsalad'
  )
sva_list <- lapply(xvars, function(x) {
  model_formula <- reformulate(x, response = 'ill')
  model_fit <- logistf(model_formula, data = Oswego)
  logistf_table(model_fit)
})
rbindlist(sva_list)
```

|variable |value       | estimate| Lower 95%| Upper 95%|      ChiSq| df|P.value     |
|:--------|:-----------|--------:|---------:|---------:|----------:|--:|:-----------|
|         |(Intercept) |     0.10|      0.02|      0.44|           |   |NA          |
|vanilla  |TRUE        |    19.67|      5.71|     90.85| 26.5155654|  1|0.000000261 |
|bakedham |TRUE        |     1.72|      0.31|     11.42|  0.3722691|  1|0.542       |
|spinach  |TRUE        |     0.53|      0.08|      2.91|  0.5040254|  1|0.478       |
|sex      |F           |     3.05|      0.89|     11.93|  3.1606421|  2|0.206       |
|         |Other       |     2.03|      0.38|     14.62|           |   |NA          |

