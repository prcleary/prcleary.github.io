+++
title = "Function to find date of end of ISO week for a date"
+++


```r
isowkend <- function(mydate)  {
  intdate <- as.POSIXlt(mydate)
  output <- intdate
  output[intdate$wday == 0 &
           !is.na(intdate$wday)] <-
    intdate[intdate$wday == 0 & !is.na(intdate$wday)]
  output[intdate$wday %in% c(1, 2, 3, 4, 5, 6) &
           !is.na(intdate$wday)] <-
    intdate[intdate$wday %in% c(1, 2, 3, 4, 5, 6) &
              !is.na(intdate$wday)] + 24 * 60 * 60 * (7 - intdate$wday[intdate$wday %in% c(1, 2, 3, 4, 5, 6) & !is.na(intdate$wday)])
  output
}
```

