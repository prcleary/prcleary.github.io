+++
title = "Advent of Code 2024: days 6-9"
+++

Got further than I thought I would - ran out of alone time when I got to day 9 .

## Day 6

Second part of this one took hours to run

```r
# Day 6
input6 <- readLines('day-6-input') |> strsplit('')
input6_matrix <- do.call(rbind, input6)
get_current_position <- function(input_matrix)
  arrayInd(which(input_matrix %in% c('^', '>', 'v', '<')), dim(input_matrix))
get_current_direction <- function(input_matrix)
  input_matrix[get_current_position(input_matrix)]
get_next_position <- function(input_matrix) {
  position <- get_current_position(input_matrix)
  direction_vector <- switch(
    get_current_direction(input_matrix),
    '^' = c(-1, 0),
    '>' = c(0, 1),
    'v' = c(1, 0),
    '<' = c(0, -1)
  )
  position + direction_vector
}
turn_right <- function(current_direction) {
  c(
    '^' = '>',
    '>' = 'v',
    'v' = '<',
    '<' = '^'
  )[current_direction]
}
check_for_obstacle <- function(input_matrix, next_position)
  input_matrix[next_position] %in% c('#', 'O')
check_for_exit <- function(input_matrix, next_position) {
  matrix_dims <- dim(input_matrix)
  (next_position[1] < 1 | next_position[1] > matrix_dims[1]) |
    (next_position[2] < 1 | next_position[2] > matrix_dims[2])
}
while (TRUE) {
  current_position <- get_current_position(input6_matrix)
  current_direction <- get_current_direction(input6_matrix)
  next_position <- get_next_position(input6_matrix)
  if (check_for_exit(input6_matrix, next_position)) {
    input6_matrix[current_position] <- 'X'
    break
  }
  if (check_for_obstacle(input6_matrix, next_position)) {
    input6_matrix[current_position] <- turn_right(current_direction)
  } else {
    input6_matrix[next_position] <- input6_matrix[current_position]
    input6_matrix[current_position] <- 'X'
  }
}
sum(unlist(input6_matrix) %in% 'X')
```
```
# 5531
```
```r
positions_visited <- arrayInd(which(input6_matrix %in% 'X'), dim(input6_matrix))
input6 <- readLines('day-6-input') |> strsplit('')
input6_matrix <- do.call(rbind, input6)
total_loops <- 0
for (i in split(positions_visited, row(positions_visited))) {
  test_matrix <- input6_matrix
  history_matrix <- matrix(0,
                           nrow = nrow(test_matrix),
                           ncol = ncol(test_matrix))
  if (test_matrix[i[[1]], i[[2]]] == '^') {
    next
  } else {
    test_matrix[i[1], i[2]] <- 'O'
  }
  while (TRUE) {
    current_position <- get_current_position(test_matrix)
    current_direction <- get_current_direction(test_matrix)
    next_position <- get_next_position(test_matrix)
    if (any(history_matrix > 4)) {
      total_loops <- total_loops + 1
      break
    }
    if (check_for_exit(test_matrix, next_position)) {
      test_matrix[current_position] <- 'X'
      break
    }
    if (check_for_obstacle(test_matrix, next_position)) {
      test_matrix[current_position] <- turn_right(current_direction)
    } else {
      test_matrix[next_position] <- test_matrix[current_position]
      test_matrix[current_position] <- 'X'
      history_matrix[current_position] <- history_matrix[current_position] + 1
    }
  }
}
total_loops
```
```
# 2165
```

## Day 7 

Recursive functions!

```r
options(scipen = 999999)
input7 <- readLines('day-7-input')
munge_data <- function(x) {
  char_list <- sapply(input7, \(x)strsplit(x, ': '))
  desired_results <- as.numeric(sapply(char_list, `[`, 1))
  values <- sapply(sapply(sapply(char_list, `[`, 2), \(x) strsplit(x, ' ')), as.integer)
  list(desired_results = desired_results, values = values)
}
search_paths <- function(interim_result,
                         next_values,
                         desired_result) {
  if (sum(next_values) == desired_result)
    return(TRUE)
  if (prod(next_values) == desired_result)
    return(TRUE)
  next_value <- rev(next_values)[1L]
  remaining_values <- next_values[-length(next_values)]
  option1 <- interim_result / next_value
  option2 <- interim_result - next_value
  if (length(remaining_values) == 1L) {
    if (option1 == remaining_values) {
      return(TRUE)
    }
    if (option2 == remaining_values) {
      return(TRUE)
    }
    return(FALSE)
  } else {
    if (option1 %% 1L == 0L) {
      return(list(
        search_paths(option1, remaining_values, desired_result),
        search_paths(option2, remaining_values, desired_result)
      ))
    } else {
      return(list(
        search_paths(option2, remaining_values, desired_result)
      ))
    }
  }
}
input7_munged <- munge_data(input7)
search_results <- mapply(
  search_paths,
  input7_munged$desired_results,
  input7_munged$values,
  input7_munged$desired_results
)
sum(input7_munged$desired_results[sapply(search_results, \(x) sum(unlist(x)) > 0)])
```
```
# 1298300076754
```
```r
get_leftmost <- function(interim_result, next_value) {
  ir_digits <- floor(log10(interim_result)) + 1
  nv_digits <- floor(log10(next_value)) + 1
  if (ir_digits - nv_digits > 0) {
    ir_leftmost <- floor(interim_result / (10 ^ nv_digits))
    ir_rightmost <- interim_result - ir_leftmost * (10 ^ nv_digits)
    if (ir_leftmost * (10 ^ nv_digits) + next_value == interim_result) {
      return_value <- ir_leftmost
    } else {
      return_value <- -1
    }
  } else {
    return_value <- -1
  }
  return_value
}
search_paths2 <- function(interim_result,
                          next_values,
                          desired_result) {
  if (sum(next_values) == desired_result) {
    return(TRUE)
  }
  if (prod(next_values) == desired_result) {
    return(TRUE)
  }
  next_value <- rev(next_values)[1L]
  remaining_values <- next_values[-length(next_values)]
  option1 <- interim_result / next_value
  option2 <- interim_result - next_value
  option3 <- get_leftmost(interim_result, next_value)
  if (length(remaining_values) == 1L) {
    if (option1 == remaining_values) {
      return(TRUE)
    }
    if (option2 == remaining_values) {
      return(TRUE)
    }
    if (option3 == remaining_values) {
      return(TRUE)
    }
    return(FALSE)
  } else {
    return(list(
      if (option1 %% 1L == 0L)
        search_paths2(option1, remaining_values, desired_result),
      if (option2 > 0)
        search_paths2(option2, remaining_values, desired_result),
      if (option3 != -1)
        search_paths2(option3, remaining_values, desired_result)
    ))
  }
}
search_results2 <- mapply(
  search_paths2,
  input7_munged$desired_results,
  input7_munged$values,
  input7_munged$desired_results
)
sum(input7_munged$desired_results[sapply(search_results2, \(x) sum(unlist(x)) > 0)])
```
```
# 248427118972289
```

## Day 8

Felt quite routine by now

```r
get_positions <- function(input_matrix, value)
  arrayInd(which(input_matrix %in% value), dim(input_matrix))

input8 <- readLines('day-8-input') |> strsplit('')
input8_matrix <- do.call(rbind, input8)
unique_values <- unique(as.vector(input8_matrix))
unique_values <- unique_values[!unique_values %in% '.']
max_row <- dim(input8_matrix)[1]
max_col <- dim(input8_matrix)[2]
test_matrix <- matrix(0L, ncol = max_col, nrow = max_row)

for (i in unique_values) {
  positions <- get_positions(input8_matrix, i)
  n_positions <- combn(1:nrow(positions), 2)
  for (j in split(n_positions, col(n_positions))) {
    point1 <- positions[j[1], ]
    point2 <- positions[j[2], ]
    antinode_pos1 <- point2 + (point2 - point1)
    antinode_pos2 <- point1 - (point2 - point1)
    if (all(antinode_pos1 > 0 &
            antinode_pos1 <= c(max_row, max_col))) {
      test_matrix[antinode_pos1[1], antinode_pos1[2]] <- 1L
    }
    if (all(antinode_pos2 > 0 &
            antinode_pos2 <= c(max_row, max_col))) {
      test_matrix[antinode_pos2[1], antinode_pos2[2]] <- 1L
    }
  }
}
sum(test_matrix)
```
```
# 409
```
```r
test_matrix <- matrix(0L, ncol = max_col, nrow = max_row)
for (i in unique_values) {
  positions <- get_positions(input8_matrix, i)
  n_positions <- combn(1:nrow(positions), 2)
  for (j in split(n_positions, col(n_positions))) {
    point1 <- positions[j[1], ]
    test_matrix[point1[1], point1[2]] <- 1L
    point2 <- positions[j[2], ]
    test_matrix[point2[1], point2[2]] <- 1L
    difference <- point2 - point1
    antinode_pos1 <- point2 + difference
    antinode_pos2 <- point1 - difference
    if (all(antinode_pos1 > 0) &
        antinode_pos1[1] <= max_row &
        antinode_pos1[2] <= max_col) {
      test_matrix[antinode_pos1[1], antinode_pos1[2]] <- 1L
    }
    if (all(antinode_pos2 > 0) &
        antinode_pos2[1] <= max_row &
        antinode_pos1[2] <= max_col) {
      test_matrix[antinode_pos2[1], antinode_pos2[2]] <- 1L
    }
    for (k in 1:max(max_col, max_row)) {
      next_diagonal1 <- point1 - k * difference
      if (all(next_diagonal1 > 0) &
          next_diagonal1[1] <= max_row &
          next_diagonal1[2] <= max_col) {
        test_matrix[next_diagonal1[1], next_diagonal1[2]] <- 1L
      }
      next_diagonal2 <- point1 + k * difference
      if (all(next_diagonal2 > 0) &
          next_diagonal2[1] <= max_row &
          next_diagonal2[2] <= max_col) {
        test_matrix[next_diagonal2[1], next_diagonal2[2]] <- 1L
      }
    }
  }
}
sum(test_matrix)
```
```
# 1308
```

## Day 9

First bit was fine but I never got another chance to focus on this

```r
input9 <- unlist(sapply(readLines('test'), \(x) strsplit(x, ''))) |>
  as.integer()
file_id <- 0L
input9_expanded <- vector('integer', sum(input9))
position <- 1L
for (i in seq_along(input9)) {
  if (i %% 2L == 1L) {
    input9_expanded[position:(position + input9[i] - 1L)] <-
      rep(file_id, input9[i])
    file_id <- file_id + 1L
    position <- position + input9[i]
  } else {
    if (input9[i] %in% 0L) {
      next
    } else {
      input9_expanded[position:(position + input9[i] - 1)] <-
        rep(NA_integer_, input9[i])
      position <- position + input9[i]
    }
  }
}
part2 <- input9_expanded
values <- input9_expanded[!is.na(input9_expanded)]
total_to_move <- length(input9_expanded) - length(values)
to_be_moved <- rev(values)[1:total_to_move]
input9_expanded[is.na(input9_expanded)] <- to_be_moved
input9_expanded[(length(values) + 1):length(input9_expanded)] <-
  rep(NA_integer_, total_to_move)
values <- input9_expanded[!is.na(input9_expanded)]
format(sum(values * (seq_along(values) - 1)), scientific = FALSE)
```
```
# 6288707484810
```

Could definitely have got further with more time - next year's goal is to get up to say 12
