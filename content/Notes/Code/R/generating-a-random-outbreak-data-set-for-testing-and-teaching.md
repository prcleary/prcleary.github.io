---
title: "Generating a random outbreak data set for testing and teaching"
date: 2023-12-11
tags:
  - R
  - Snippet
---

A function I just found in my old code dump, for generating dummy outbreak data sets. It doesn't include exposure variables, but somewhere I have some code that will generate some exposure data with (approximate) given odds/risk ratios. I think I was using it to test something, but it could be useful for teaching too. It obviously did something with a file of postcodes, but still works without that. 

Install the following packages before using it:

- `data.table`
- `uuid`
- `randomNames`

```r
#' Generate Random Outbreak Data Set
#'
#' @param n_obs Number of observations (randomly generated if not specified)
#' @param ob_duration_days Duration of outbreak in days (randomly generated if not specified)
#' @param case_status Case status of fictitious persons created (defaults to "Confirmed", "Probable", "Possible" and "Excluded" but could be anything)
#' @param postcodes Data table containing valid UK postcodes
#' @param prob_hospitalised Probability of hospitalisation (default of 0.1)
#' @param prob_died Probability of death (default of 0.01)
#'
#' @return Data frame containing randomly generated outbreak data set
#' @export
#'
#' @examples
#' output <- gen_random_outbreak()
#' View(output)
#' # Can use `gro()` for shorthand
gen_random_outbreak <-
  gro <-
  function(n_obs = sample(1:100, 1),
           ob_duration_days = sample(7:100, 1),
           case_status = c('Confirmed', 'Probable', 'Possible', 'Excluded'),
           postcode_file_location = NULL,
           prob_hospitalised = 0.1,
           prob_died = 0.01) {
    genders <- c('Male', 'Female')
    ethnicities <-
      c('African American', 'Asian', 'White')
    output <-
      data.table::data.table(
        gender = sample(genders, n_obs, replace = TRUE),
        ethnicity = sample(ethnicities, n_obs, replace = TRUE)
      )
    random_names <-
      output[, randomNames::randomNames(gender = gender,
                                        ethnicity = ethnicity)]
    output[, name := random_names]
    output[, c('surname',
               'firstname') := data.table::tstrsplit(name,
                                                     ', ')]
    output[, name := NULL]
    id <- sapply(seq_along(1:n_obs), uuid::UUIDgenerate)
    output[, id := id]
    output[, dob := Sys.Date() - sample(1:85 * 365, n_obs,
                                        replace = TRUE)]
    output[, status := sample(case_status, n_obs,
                              replace = TRUE)]
    if (!is.null(postcode_file_location)) {
      postcodes <- data.table::fread(postcode_file_location,
                                     sep = ',',
                                     header = FALSE)[[1]]
      output[, postcode := sample(postcodes, n_obs,
                                  replace = TRUE)]
    }
    output[, onset := sample(Sys.time() - sample(3:ob_duration_days * 24 * 60 * 60,
                                                 n_obs, replace = TRUE))]
    output[, onset_date := as.Date(onset)]
    output[, onset_time := format(onset, '%H:%M')]
    output[, onset := NULL]
    output[, spec_date := onset_date + sample(0:3, n_obs, replace = TRUE)]
    output[, hospitalised := rbinom(n_obs, size = 1, prob = prob_hospitalised)]
    output[, died := rbinom(n_obs, size = 1, prob = prob_died)]
    dob_to_missing <-
      output[, which(dob %in% sample(dob, (1 + n_obs / 10)))]
    output[dob_to_missing, dob := NA]
    data.table::setDF(output)
    output
  }
```

Example output:

|gender |ethnicity        |surname  |firstname  |id                                   |dob        |status    |onset_date |onset_time |spec_date  | hospitalised| died|
|:------|:----------------|:--------|:----------|:------------------------------------|:----------|:---------|:----------|:----------|:----------|------------:|----:|
|Female |White            |Kelly    |Alyssa     |b4a63de8-985f-11ee-8000-13385a52bcb1 |1962-12-26 |Confirmed |2023-11-27 |19:58      |2023-11-30 |            0|    0|
|Female |White            |Larson   |Mary Grace |6424739a-0364-4d91-846d-37f48b7e0f7a |1980-12-21 |Possible  |2023-11-18 |19:58      |2023-11-18 |            0|    0|
|Male   |Asian            |Tran     |Daniel     |d768f0e5-8000-4240-86ae-17859340d779 |NA         |Possible  |2023-11-05 |19:58      |2023-11-06 |            0|    0|
|Male   |White            |Townsend |Walker     |bfdd96ec-0b1e-42b6-ac77-b95c4fb7e0e9 |1971-12-24 |Excluded  |2023-11-08 |19:58      |2023-11-10 |            0|    0|
|Male   |African American |Tolbert  |Deven      |f91a7b53-5c62-4af6-aa59-6c4e02caf5f0 |1992-12-18 |Possible  |2023-11-05 |19:58      |2023-11-05 |            1|    0|
|Male   |White            |Hazelton |Tyler      |9c32e3a2-939e-429b-aa58-2a3551631800 |1940-12-31 |Confirmed |2023-11-20 |19:58      |2023-11-20 |            0|    0|

