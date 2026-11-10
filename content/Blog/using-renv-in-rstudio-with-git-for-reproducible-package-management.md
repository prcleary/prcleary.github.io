---
title: Using renv in RStudio with Git for reproducible package management
date: 2022-11-21
tags:
  - R
  - renv
---

Tend to be quite minimalist in my use of R packages where possible, often only using `data.table` and `ggplot2`, so I don't worry much about breaking changes. But sometimes you have to use unstable R packages (version number < 1.0.0). I wish there was a way to "pin" the version of a single package without causing problems with the installation of other packages, but instead the best way currently seems to be to use the `renv` package and "pin" the versions of all the packages you are using for a particular project. I had to use it last week and am recording what worked for me (for posterity).

1. Create an RStudio project and initialise Git.
2. Run `renv::init()`.
3. Install packages using `install.packages`, `remotes::install_git` and/or `remotes::install_github`.
4. Run `renv::snapshot()`.
5. Commit the following: `.Rprofile`, `.gitignore`, `renv.lock` and `.Rproj` files; also `renv/` folder

After cloning the project, another user can then run `renv::restore()` to get the same package versions.

More info:

- [Introduction to renv • renv](https://rstudio.github.io/renv/articles/renv.html)
- [renv demo](https://maelle.github.io/renv-demo/#/)
- [renv: Project Environments for R - Posit](https://posit.co/blog/renv-project-environments-for-r/)

