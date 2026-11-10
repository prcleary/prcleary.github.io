---
title: Function to look for filenames of form yyyymmddpattern and select one with latest date
date: 2025-02-20
tags:
  - R
  - Snippet
---


```r
latestfile <-
  function(path = ".",
           pattern = "",
           ignore.case = TRUE,
           recursive = FALSE)  {
    filenames <-
      list.files(
        path = path,
        pattern = pattern,
        ignore.case = ignore.case,
        recursive = recursive
      )
    shortlist <- filenames[grep("^[0-9]{8}.*", filenames)]
    shortlistdates <- as.numeric(substr(shortlist, 1, 8))
    latestfile <- shortlist[which.max(shortlistdates)]
    latestfile
  }
```

