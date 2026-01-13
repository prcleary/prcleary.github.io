+++
title = "My devtools cheatsheet"
+++

- Build pkgdown site: `usethis::use_pkgdown(); pkgdown:build_site()`
- Load functions without installing: `devtools::load_all()`
- Run tests interactively: `devtools::test()
- Generate Roxygen2 documentation from roxygen2 comments above functions: `devtools::document()
- Run R CMD check: `devtools::check()`
- Build package: `devtools::build()`
- Install package: `devtools::install()`

