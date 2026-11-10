---
title: Create .gitignore file from R
date: 2022-10-26
tags:
  - R
  - Snippet
  - Git
---

Amend with your own files/directories.

```r
fileConn <- file('.gitignore')
writeLines(
  c(
    'data',
    'tmpdata',
    'outputs',
    'gislookup',
    '*.Rhistory',
    '~$*.*',
    '.Rproj.user'
  ),
  fileConn
)
close(fileConn)
```

