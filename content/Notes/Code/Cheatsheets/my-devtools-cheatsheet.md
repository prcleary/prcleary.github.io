---
title: "My devtools cheatsheet"
date: 2025-09-11
tags:
  - R
---

- Build pkgdown site: `usethis::use_pkgdown(); pkgdown:build_site()`
- Load functions without installing: `devtools::load_all()`
- Run tests interactively: `devtools::test()`
- Generate Roxygen2 documentation from roxygen2 comments above functions: `devtools::document()`
- Run R CMD check: `devtools::check()`
- Build package: `devtools::build()`
- Install package: `devtools::install()`

