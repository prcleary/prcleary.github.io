+++
title = "Advent of Code 2024: days 1-5"
+++

Here are my solutions so far:

## Day 1

Nice easy one to start

```r
library(data.table)

input1 <- fread('day-1-input')
sorted_lists <- data.table(list1 = sort(input1$V1),
                           list2 = sort(input1$V2))
sorted_lists[, distance := abs(list1 - list2)][, sum(distance)]
```
```
## [1] 3246517
```
```r
run_lengths <- rle(sort(input1$V2)) |> setDT()
similarity_table <- run_lengths[input1, on = 'values==V1',
                                ][!is.na(lengths)]
similarity_table[, similarity := lengths * values
                 ][, sum(similarity)]
```
```
## [1] 29379307
```
## Day 2

Still not too bad

```r
is_monotonic <- function(x) length(unique(sign(diff(x)))) %in% 1
steps_are_safe <- function(x) all(abs(diff(x)) %in% 1:3)

input2 <- fread('day-2-input', sep = NULL, header = FALSE)

input2[, char_list := strsplit(V1, ' ')
       ][, num_list := lapply(char_list, as.numeric)
         ][, monotonic := sapply(num_list, is_monotonic)
           ][, safe_steps := sapply(num_list, steps_are_safe)
             ][, safe := ifelse(monotonic & safe_steps, TRUE, FALSE)
               ][, sum(safe)]
```
```
## [1] 299
```
```r
dampener <- function(x) {
  safe_steps <- steps_are_safe(x)
  monotonic <- is_monotonic(x)
  if (monotonic & safe_steps)
    TRUE
  else  {
    subset_list <- combn(x, length(x) - 1, simplify = FALSE)
    monotonic_list <- sapply(subset_list, is_monotonic)
    safe_step_list <- sapply(subset_list, steps_are_safe)
    any(monotonic_list & safe_step_list)
  }
}

input2[, safe_damped := sapply(num_list, dampener)
       ][, sum(safe_damped)]
```
```
## [1] 364
```

## Day 3

The last easy one I think

```r
input3 <- readLines('day-3-input')
matches <- regmatches(input3, gregexpr('mul\\(\\d{1,3},\\d{1,3}\\)', input3)) |> unlist()
num_matches <- regmatches(matches, gregexpr('\\d{1,3}', matches))
sum(sapply(num_matches, \(x) prod(as.numeric(x))))
```
```
## [1] 178538786
```
```r
DT <- data.table(matches = regmatches(input3,
  gregexpr("mul\\(\\d{1,3},\\d{1,3}\\)|do\\(\\)|don't\\(\\)", input3)
) |> unlist())
DT[matches %in% 'do()', do := 1L]
DT[matches %in% "don't()", do := 0L]
DT[, do := nafill(do, type = 'locf')]
DT <- DT[!do %in% 0 & !matches %in% 'do()']
DT[, num_matches := regmatches(matches, gregexpr('\\d{1,3}', matches))
   ][, product := sapply(num_matches, \(x) prod(as.numeric(x)))
     ][, sum(product)]
```
```
## [1] 102467299
```

## Day 4

Resorted to StackOverflow to find out how to get diagonals of a matrix

```r
count_pattern <- function(x, pattern = 'XMAS') {
  strings_forwards <- sapply(x, \(x) paste0(x, collapse = ''))
  count_forwards <- regmatches(strings_forwards,
                               gregexpr(pattern, strings_forwards)) |>
    sapply(length) |>
    sum()
  strings_backwards <- sapply(x, \(x) paste0(rev(x), collapse = ''))
  count_backwards <- regmatches(strings_backwards,
                               gregexpr(pattern, strings_backwards)) |>
    sapply(length) |>
    sum()
  count_forwards + count_backwards
}

input4 <- readLines('day-4-input') |> strsplit('')
input4_matrix <- do.call(rbind, input4)
input4_vertical <- as.list(as.data.frame(input4_matrix))
diagonals_left <- split(input4_matrix, row(input4_matrix) - col(input4_matrix))
diagonals_right <- split(input4_matrix, row(input4_matrix) + col(input4_matrix))

count_pattern(input4) +
  count_pattern(input4_vertical) +
  count_pattern(diagonals_left) +
  count_pattern(diagonals_right)
```
```
## [1] 2464
```
```r
x_mas_count <- 0
for (i in 1:(ncol(input4_matrix) - 2)) {
  for (j in 1:(nrow(input4_matrix) - 2)) {
    diagonal_left <- list(c(input4_matrix[i, j], input4_matrix[i + 1, j + 1], input4_matrix[i + 2, j + 2]))
    diagonal_right <- list(c(input4_matrix[i + 2, j], input4_matrix[i + 1, j + 1], input4_matrix[i, j + 2]))
    if (count_pattern(diagonal_left, 'MAS') + count_pattern(diagonal_right, 'MAS') == 2) x_mas_count <- x_mas_count + 1
  }
}
x_mas_count
```
```
## [1] 1982
```

## Day 5

Seriously went down a blind alley with this one, trying to find a more elegant solution

```r
input5_rules <- readLines('day-5-input-rules') |>
  strsplit('\\|') |>
  lapply(as.numeric)
input5_updates <- readLines('day-5-input-updates') |>
  strsplit(',') |>
  lapply(as.numeric)
apply_rule <- function(x, rule, swap = FALSE) {
  if (length(intersect(x, rule)) < 2) {
    TRUE
  } else {
    before <- match(rule[1], x)
    after <- match(rule[2], x)
    correct <- before < after
    if (swap) {
      if (correct) {
        return(x)
      } else {
        x[c(after, before)] <- rule
        return(x)
      }
    } else {
      return(correct)
    }
  }
}
sum_middlepagenos <- 0
incorrect_updates <- list()
for (i in input5_updates) {
  rules_passed <- TRUE
  for (j in input5_rules) {
    if (apply_rule(i, j)) {
      next
    } else {
      rules_passed <- FALSE
    }
  }
  if (rules_passed) {
    middlepageno <- i[ceiling(length(i) / 2)]
    sum_middlepagenos <- sum_middlepagenos + middlepageno
  } else {
    incorrect_updates <- append(incorrect_updates, list(i))
  }
}
sum_middlepagenos
```
```
## [1] 5747
```
```r
sum_middlepagenos2 <- 0
for (i in incorrect_updates) {
  relevant_rules <- list()
  for (j in input5_rules) {
    if (length(intersect(i, j)) < 2) {
      next
    } else {
      relevant_rules <- append(relevant_rules, list(j))
    }
  }
  all_passed <- FALSE
  while (!all_passed) {
    rules_to_pass <- length(relevant_rules)
    passed_rules <- 0
    for (k in relevant_rules) {
      if (apply_rule(i, k)) {
        passed_rules <- passed_rules + 1
      } else {
        i <- apply_rule(i, k, swap = TRUE)
      }
    }
    if (passed_rules == rules_to_pass)
      all_passed <- TRUE
  }
  middlepageno2 <- i[ceiling(length(i) / 2)]
  sum_middlepagenos2 <- sum_middlepagenos2 + middlepageno2
}
sum_middlepagenos2
```
```
## [1] 5502
```

Excellent way to test/develop your coding skills - would like to see if I can get to day 10 now
