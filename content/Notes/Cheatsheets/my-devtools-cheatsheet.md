---
title: "My devtools cheatsheet"
tags:
  - R
  - Cheatsheet
date: 2025-09-11
---

# My devtools cheatsheet

> [!abstract] Summary
> Quick-reference for the `{devtools}` workflow when developing R packages: load, document, test, check, build, install, and publish a `pkgdown` site. 

---

## Commands

| Task | Command |
|---|---|
| Load all functions without installing | `devtools::load_all()` |
| Generate `.Rd` docs from roxygen2 comments | `devtools::document()` |
| Run tests interactively | `devtools::test()` |
| Run `R CMD check` | `devtools::check()` |
| Build the package tarball | `devtools::build()` |
| Install the package locally | `devtools::install()` |
| Set up a `pkgdown` site (one-off) | `usethis::use_pkgdown()` |
| Build the `pkgdown` site | `pkgdown::build_site()` |

### Typical inner-loop order

1. Edit code or roxygen comments.
2. `devtools::document()` — regenerate `.Rd` files and `NAMESPACE`.
3. `devtools::load_all()` — pick up changes without reinstalling.
4. `devtools::test()` — run the test suite.
5. `devtools::check()` — full `R CMD check` before committing.

---

## LINKS

- `devtools` — <https://devtools.r-lib.org/>
- `pkgdown` — <https://pkgdown.r-lib.org/>
- R Packages (Wickham & Bryan) — <https://r-pkgs.org/>
