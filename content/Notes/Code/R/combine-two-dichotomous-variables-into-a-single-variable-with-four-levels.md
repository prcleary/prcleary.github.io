---
title: Combine two dichotomous variables into a single variable with four levels
date: 2022-11-10
tags:
  - R
  - Snippet
---


Had a lot of dichotomous variables and the ask was to combine each pair into a single four-level variable: 0 (--), 1 (+-), 2 (-+) and 3 (++).

```r
library(data.table)
library(knitr)

# Random data
random_obs <- function(n) {
  sample(c('Yes', 'No', 'Y', 'y', 'yes', 'no', 'N', 'n', NA_character_), n, replace = TRUE)
}
outbreakdata <- data.table(
  beef_which_home_meatballs_had = random_obs(25),
  beef_which_out_meatballs_had = random_obs(25),
  chicken_which_home_breast_had = random_obs(25),
  chicken_which_home_nuggets_popcorn_had = random_obs(25),
  chicken_which_out_breast_had = random_obs(25),
  chicken_which_out_nuggets_popcorn_had = random_obs(25),
  vegetables_consumed_home_iceberg_had = random_obs(25),
  vegetables_consumed_home_other_lettuce_had = random_obs(25),
  vegetables_consumed_out_iceberg_had = random_obs(25),
  vegetables_consumed_out_other_lettuce_had = random_obs(25),
  random_other_one_home_had = random_obs(25),
  random_yetanother_one_out_had = random_obs(25)
)

# Combine variables
# Not a good choice of name for a function
# as clashes with something in ggplot2
combine_vars <- function(x, y) {
  yes_vars <- c('Yes', 'Y', 'y', 'yes')
  x2 <- x %in% yes_vars,
  y2 <- y %in% yes_vars * 2
  x2 + y2
}

# You can use it to create a single combined variable
outbreakdata[, beef_which_combined_meatballs_had := combine_vars(beef_which_home_meatballs_had,                                                  beef_which_out_meatballs_had)]

outbreakdata |> kable()

# But to do it en masse use the function below

#' Combine Lots Of Variables
#'
#' @param x A data.table of data
#' @param regex1 Regular expression (regex) to select names of first variable to combine
#' @param regex2 Regular expression (regex) to select names of second variable to combine
#' @param replacement What each regex will be replaced with in the name of the combined variable.
#' @param overwrite Do you want to overwrite existing fields? (default FALSE)
#'
#' @return A data.table of transformed data
#' @export
#'
#' @examples
combine_lots_of_variables <-
  function(x,
           regex1,
           regex2,
           replacement = '_combined_',
           overwrite = FALSE) {
    x <- copy(x)
    allvarnames <- names(x)
    # Identify possible new combined variables to create
    possiblenewvarnames <-
      sort(unique(gsub(
        regex1, replacement, grep(regex1, allvarnames, value = TRUE)
      )))
    # Go through each possible new variable name
    # If there are not simply two matching variables to combine then skip
    # Combine the variables
    # unless there is an existing variable of that name
    # and "overwrite" is set to FALSE (default)
    for (i in possiblenewvarnames) {
      if (i %in% allvarnames & !overwrite) {
        message('Skipping ', i, ' as variable exists and overwrite is FALSE')
        next
      } else {
        var1 <- gsub(replacement, regex1, i)
        var2 <- gsub(replacement, regex2, i)
        if (var1 %in% allvarnames & var2 %in% allvarnames) {
          message('Creating ',
                  i,
                  ' from ',
                  var1,
                  ' and ',
                  var2)
          x[, eval(i) := combine_vars(get(var1), get(var2))]
        } else {
          message('Skipping ', i, ' as ', var1, ' and ', var2, ' do not both exist')
          next
        }
      }
    }
    x
  }

# Example running code with regular expression
# Note that regular expression means '_home_' OR '_out_'
# Run it without overwriting existing variables (default and safer)
newoutbreakdata <-
  combine_lots_of_variables(outbreakdata,
                            regex1 = '_home_',
                            regex2 = '_out_',
                            replacement = '_combined_')

newoutbreakdata |> kable()
```

