+++
title = "Notes on the data.table package"
+++

> Work in progress

- Advantages of `data.table`: 
    - speed (especially with large data sets)
    - concise code (useful when working interactively)
    - some conceptual similarities with SQL syntax
    - syntax builds on R data frame syntax ("data frame on steroids")
    - mature and actively developed package
    - chaining (equivalent to pipes)
    - very fast function for reading CSV files (`fread`)
    - a `data.table` object behaves like a data frame in many ways
    - `data.table` can be used alongside tidyverse where required 
      - or use `dtplyr` to write tidyverse code and get almost `data.table` speed, e.g. for speeding up large lookup tables)
    - minimal dependencies
      - can do almost everything tidyverse can (with notable exception of `dbplyr` functionality for reading from databases, which is mostly [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) anyway), *with only one package* (vs 10-20 typically for tidyverse)
    - lots of help on StackOverflow, with other users typically competing to achieve complex data manipulations with a single line of `data.table` code
- Disadvantages: 
    - something else to learn
    - may require more familiarity with base R or R internals than tidyverse (e.g. `lapply`, `NA_integer_` and `1L` may not be your thing)
		- also need to understand what a data frame is, ie a list of vectors with special properties (names must be unique, some matrix-like properties allowing extraction of rows/columns, all elements must be vectors (vectors can only contain one type of data) of same length, has row numbers etc)
		- a `data.table` is also a list and you will see list-related functions applied to it
    - code can seem cryptic
    - various traps for the unwary
- Faster than: 
    - tidyverse
    - pandas (Python)
    - Julia
- Not necessarily faster than: 
    - polars
    - reading data in optimised data formats like Apache Parquet
    - `collapse`: uses similar optimisations but has more statistical functionality 
      - main page: [Advanced and Fast Data Transformation in R • collapse](https://sebkrantz.github.io/collapse/)
      - can be used with tidyverse: [collapse for tidyverse Users • collapse](https://sebkrantz.github.io/collapse/articles/collapse_for_tidyverse_users.html)
    - `fst` package: may be faster for reading/writing data files
- Why is `data.table` so fast? 
    - optimisations of data structures
    - compilation of functions from C code
    - efficient indexing
    - parallel processing
    - typically changes R data objects "in place" 
      - instead of copying the object in RAM and changing that then replacing the original object, which is the memory-hungry default
- Dependencies: 
    - mostly core R packages
    - suggested to use `bit64` package if working with large integers (you will need it for NHS numbers)
- Associated packages (rarely needed): 
    - `kit`: adds some optimised data manipulation functions
    - `dataPreparation`: automated data preparation for data science
    - the "`fastverse`" (metapackage)
- various options can be set for `data.table`
  - after loading the package, run `options()` and look at the ones beginning `$datatable.` 
  - I have never touched these
  - `data.table` will automatically identify the number of CPU cores it can use for parallel processing
- Installation: available on CRAN
- Reading a CSV file
  ```{r}
  DT <- fread(datafile.csv)
  ```
  - automatically detects data types 
    - NB if many blanks at start of file can fail - see `colClasses` if so
  - useful options: select, drop
  - can use command line tools to preprocess data 
    - see [5 handy options in R data.table’s fread | InfoWorld](https://www.infoworld.com/article/3566384/5-handy-options-in-r-datatables-fread.html)
- Convert a data frame or tibble to a `data.table` (in place)
  ```r
  setDT(mydataframe)
  setDT(mytibble)
  ```
  - can also use (makes a copy):
	
		```{r}
		DT <- as.data.table(DF)
		```
- Read an Excel file into a `data.table`
  ```{r}
  library(readxl)
  DT <- read_excel(datafile.xlsx) |>
    setDT()
  ```
- Workaround for reading in Parquet files: [fread feather · Issue #2026 · Rdatatable/data.table · GitHub](https://github.com/Rdatatable/data.table/issues/2026#issuecomment-1408551244)
  - only works if a `data.table` is saved as Parquet
- Creating a `data.table` from vectors
  ```{r}
  DT <- data.table(x = rnorm(100), y = rnorm(100))
  ```
- Copying a `data.table`
  ```{r}
  newDT <- copy(oldDT)  # deep copy
  ```
  - Beginner mistake 1: not distinguishing between shallow and deep copies
    ```{r}
    newDT <- oldDT  # shallow copy
    ```
  - with a shallow copy, any changes to `newDT` will also be made to `oldDT`
  - this is because they are just different names for the same object in memory
- Syntax for a `data.table` object simplifies and extends data frame syntax
  - Beginner mistake 2: using dollar notation with `data.table`s
    - as with a data frame you can select rows of data with an integer, logical or character vector, or an expression that evaluates to one of these
    - but unlike with a data frame, columns are assumed to be in the `data.table` unless otherwise indicated
    - so you should rarely need to use dollar notation:
      ```{r}
      DT[DT$age > 17,]  # will work but unnecessary typing
      DT[age > 17]  # all that is needed, and slightly more readable IMHO - note no comma is needed
      ```
    - logical `NA`s are treated as false (usually safest)
    - you can put a lot more in i - see ? data.table
    - joins with other data.tables - ? with data frames
    - lists, matrices - why?
  - i, j, k
  - grouping: by, keyby
  - list and `.`
  - special symbols:
    - `.N`
    - `.SD` - NB: assignment
    - others which I have rarely used e.g. `.I`. `.GRP`, `.BY`, `.NGRP`, `.EACHI`
    - `.I` (row number)
- Keys, primary and secondary
- Renaming variables in place
- Ordering variables in place
  
- Use "fast" versions of functions, prefixed with f, e.g. `fifelse`
- Beginner mistake 3: trying to translate literally from tidyverse syntax
- Differences between data frame and `data.table`:
    - with = FALSE
    - using correct NA and 1L and coercion
- Tricks:
  - lapply, mapply, which.max
  - `[]` to print it out
  - row-wise operations a bit kludgy ? use collapse
  - "piping" with chains
- `data.table` in R packages: 
  - data.table should be in Imports, not Depends (you shouldn't use the Depends field for anything anyway)
    - if you put it in Suggests, then add `.datatable.aware=TRUE` to one of the R/* files
  - if you use the `usethis` package then this has a handy `use_data_table` function 
  - you can also just import the bits you want if you are concerned about masking 
    - e.g. you could just import `fread`
  - more detail here: [Importing data.table](https://cran.r-project.org/web/packages/data.table/vignettes/datatable-importing.html)
- joins, merges, rollup, dicing, pivot, reshape, interval join, inequality join
- look at pinboard for other ideas
- Documentation: [Enhanced data.frame — data.table-package • data.table](https://rdatatable.gitlab.io/data.table/reference/data.table.html#)
- FAQ: [datatable-faq.pdf](http://datatable.r-forge.r-project.org/datatable-faq.pdf)
- Cheatsheets:
  - [The ultimate R data.table cheat sheet | InfoWorld](https://www.infoworld.com/article/3575086/the-ultimate-r-datatable-cheat-sheet.html)
  - [datatable - datatable.pdf](https://raw.githubusercontent.com/rstudio/cheatsheets/master/datatable.pdf)
- Useful links:
  - [Getting started · Rdatatable/data.table Wiki · GitHub](https://github.com/Rdatatable/data.table/wiki/Getting-started)
  - [Articles · Rdatatable/data.table Wiki · GitHub](https://github.com/Rdatatable/data.table/wiki/Articles)
  - [Convenience features of fread · Rdatatable/data.table Wiki · GitHub](https://github.com/Rdatatable/data.table/wiki/Convenience-features-of-fread)
  - [Do's and Don'ts · Rdatatable/data.table Wiki · GitHub](https://github.com/Rdatatable/data.table/wiki/Do%27s-and-Don%27ts)
  - [A data.table and dplyr tour · Home](https://atrebas.github.io/post/2019-03-03-datatable-dplyr/#reshape-data)
  - [A gentle introduction to data.table · Home](https://atrebas.github.io/post/2020-06-17-datatable-introduction/)
  
