---
title: "Is polars faster than data.table?"
date: 2023-04-24
tags:
  - R
  - data.table
  - polars
---

I use the `data.table` package in preference to the tidyverse, mainly
because it is fast at doing complex manipulations on intermediate-sized
data sets and I’m impatient. `data.table` handles tasks in seconds that
might take much longer to run (or in extreme circumstances be
impossible) with the tidyverse.

I was looking at some comparative performance benchmarks for
`data.table` and other tools
[here](https://h2oai.github.io/db-benchmark/) recently (there is a
different version [here](https://duckdblabs.github.io/db-benchmark/))
and was interested to see that there is now a library called
[Polars](https://www.pola.rs/) that is faster than `data.table`. It can
be used via Python or R.

Polars is fast because it is written in an (increasing popular) language
called [Rust](https://www.rust-lang.org/) (fast), uses the [Apache
Arrow](https://arrow.apache.org/) optimised memory format (fast), uses
parallelisation (fast) and can optimise queries to its API (also fast).
The Arrow (in memory) format also works well with the
[Parquet](https://parquet.apache.org/) (compressed file) format.
`data.table` doesn’t directly support reading Parquet files though
[there are
workarounds](https://github.com/Rdatatable/data.table/issues/2026). I
will do a blog post on new data/file formats and new tools for
importing/exporting data in R at some point.

As I am primarily an R user, I was interested to learn more about
`polars` and find out if `data.table` was no longer the fastest option
for me.

The instructions I used for installing `polars` (version 0.5.0.9000) are
[here](https://github.com/pola-rs/r-polars). I installed some additional
packages as explained later.

``` r
library(data.table)
# install.packages('polars', repos = 'https://rpolars.r-universe.dev')
library(polars)
# install.packages('wakefield')
# install.packages('microbenchmark')
```

Now I needed to generate some random data. I used the
appropriately-named [`wakefield`](https://github.com/trinker/wakefield)
package to make up some data and then saved it as a CSV file.

*Note that I will show tables as Markdown with `knitr::kable`, and will
measure how long code takes to run using the `microbenchmark` package.*

``` r
dummydata <- wakefield::r_data_frame(
  n = 5000,
  name,
  dob,
  age,
  sex,
  height,
  smokes,
  marital,
  education,
  children,
  employment,
  death
)
write.csv(dummydata, 'dummydata.csv')
knitr::kable(head(dummydata))
```

| Name    | DOB        | Age | Sex    | Height | Smokes | Marital       | Education                           | Children | Employment | Death |
|:--------|:-----------|----:|:-------|-------:|:-------|:--------------|:------------------------------------|---------:|:-----------|:------|
| Angely  | 2010-02-05 |  29 | Female |     69 | FALSE  | Divorced      | Bachelor’s Degree                   |        0 | Full Time  | FALSE |
| Raelyn  | 2008-07-24 |  71 | Male   |     64 | FALSE  | Divorced      | 9th Grade to 12th Grade, No Diploma |        1 | Full Time  | TRUE  |
| Breale  | 2009-01-26 |  75 | Female |     76 | TRUE   | Separated     | Master’s Degree                     |        1 | Full Time  | TRUE  |
| Earth   | 2009-12-26 |  68 | Male   |     70 | FALSE  | Divorced      | Master’s Degree                     |        1 | Student    | FALSE |
| Cameran | 2010-02-13 |  27 | Female |     75 | FALSE  | Never Married | Regular High School Diploma         |        2 | Full Time  | FALSE |
| Daejohn | 2008-05-30 |  36 | Male   |     70 | TRUE   | Never Married | Master’s Degree                     |        1 | Full Time  | FALSE |

Next I needed to learn the `polars` syntax. Some of the documentation is
still in the early stages and may be being outpaced by development, as
some of the examples given didn’t work for me. If you know Python (and
particularly the pandas module),`polars` syntax will look familiar, as
it’s a bit like Python code with the dots replaced by dollar signs.
`polars` functions are prefixed with `pl$`, whereas `polars` methods
(methods are just functions attached to an object) are prefixed with the
name of the object. Because `polars` uses chaining you can present your
code in a tidyverse way as you will see below.

I first compared the time by `polars` to read in a CSV
file (5,000 rows) compared to `data.table`:

``` r
microbenchmark::microbenchmark(
  'polars' = {
    dd_po <- pl$read_csv('dummydata.csv')
    },
  'data.table' = {
    dd_dt <- fread('dummydata.csv')
  })
```

    ## Unit: milliseconds
    ##        expr    min      lq     mean  median      uq     max neval cld
    ##      polars 2.6008 2.95305 3.678027 3.32280 3.98600  9.5663   100  a
    ##  data.table 5.1824 5.72105 6.865466 6.26545 6.99405 22.0428   100   b

`polars` was almost twice as fast (using median time) as
`data.table::fread` at reading in a CSV file with 5,000 rows. This is an
impressive start, and using Parquet files to save data might speed that
up even more.

However `polars` was much slower at converting an existing data frame
into its own format than `data.table`:

``` r
dd_df <- as.data.frame(dd_dt)
microbenchmark::microbenchmark(
  'polars' = {
    dd_po2 <- pl$DataFrame(dd_df)
  },
  'data.table' = {
    setDT(dd_df)
  }
)
```

    ## Unit: microseconds
    ##        expr    min      lq     mean median     uq     max neval cld
    ##      polars 2204.3 2810.75 4387.394 3565.6 4828.4 22119.3   100  a
    ##  data.table   63.5  112.15  196.147  159.5  225.3   880.6   100   b

Functions like `class`, `head`, `tail`, `names` and `dim` seem to work
as expected (see
[here](https://pola-rs.github.io/polars/py-polars/html/reference/expressions/index.html)
for a list), though as you can see `polars` has its own way of printing
abbreviated tabular data to the console.

``` r
# Use dd_po2$to_data_frame() to convert back
class(dd_po2)
```

    ## [1] "DataFrame"

``` r
head(dd_po2)
```

    ## shape: (6, 12)
    ## ┌─────┬─────────┬────────────┬─────┬─────┬─────────────────────┬──────────┬────────────┬───────┐
    ## │ V1  ┆ Name    ┆ DOB        ┆ Age ┆ ... ┆ Education           ┆ Children ┆ Employment ┆ Death │
    ## │ --- ┆ ---     ┆ ---        ┆ --- ┆     ┆ ---                 ┆ ---      ┆ ---        ┆ ---   │
    ## │ i32 ┆ str     ┆ date       ┆ i32 ┆     ┆ str                 ┆ i32      ┆ str        ┆ bool  │
    ## ╞═════╪═════════╪════════════╪═════╪═════╪═════════════════════╪══════════╪════════════╪═══════╡
    ## │ 1   ┆ Angely  ┆ 2010-02-05 ┆ 29  ┆ ... ┆ Bachelor's Degree   ┆ 0        ┆ Full Time  ┆ false │
    ## │ 2   ┆ Raelyn  ┆ 2008-07-24 ┆ 71  ┆ ... ┆ 9th Grade to 12th   ┆ 1        ┆ Full Time  ┆ true  │
    ## │     ┆         ┆            ┆     ┆     ┆ Grade, No Dipl...   ┆          ┆            ┆       │
    ## │ 3   ┆ Breale  ┆ 2009-01-26 ┆ 75  ┆ ... ┆ Master's Degree     ┆ 1        ┆ Full Time  ┆ true  │
    ## │ 4   ┆ Earth   ┆ 2009-12-26 ┆ 68  ┆ ... ┆ Master's Degree     ┆ 1        ┆ Student    ┆ false │
    ## │ 5   ┆ Cameran ┆ 2010-02-13 ┆ 27  ┆ ... ┆ Regular High School ┆ 2        ┆ Full Time  ┆ false │
    ## │     ┆         ┆            ┆     ┆     ┆ Diploma             ┆          ┆            ┆       │
    ## │ 6   ┆ Daejohn ┆ 2008-05-30 ┆ 36  ┆ ... ┆ Master's Degree     ┆ 1        ┆ Full Time  ┆ false │
    ## └─────┴─────────┴────────────┴─────┴─────┴─────────────────────┴──────────┴────────────┴───────┘

`data.table` was comparable for selecting columns, whether or not you
used the “lazy” option with `polars`:

``` r
microbenchmark::microbenchmark(
 'polars' = {
   dd_po$select(c('Name', 'DOB'))
 },
 'polars lazy' = {
   dd_po$lazy()$select(c('Name', 'DOB'))$collect()
 },
 'data.table' = {
   dd_dt[, .(Name, DOB)]
 }
)
```

    ## Unit: microseconds
    ##         expr   min     lq    mean median      uq    max neval cld
    ##       polars 490.8 641.85 823.833 784.65  931.80 2083.5   100   a
    ##  polars lazy 527.4 662.80 847.492 822.60 1019.95 1660.3   100   a
    ##   data.table 519.4 714.10 941.730 822.05  975.75 8226.5   100   a

`data.table` was much faster for applying a function to a column of
data:

``` r
microbenchmark::microbenchmark(
  'polars'= {
    dd_po$select('Children')$sum()
  },
  'polars lazy'= {
    dd_po$lazy()$select('Children')$sum()$collect()
  },
  'data.table' = {
    dd_dt[, sum(Children)]
  }
)
```

    ## Unit: microseconds
    ##         expr    min      lq     mean  median      uq    max neval cld
    ##       polars 1129.1 1611.10 1895.107 1813.35 2114.20 5452.8   100 a
    ##  polars lazy  766.4 1002.55 1158.662 1111.20 1278.00 2137.7   100  b
    ##   data.table  262.9  486.95  609.637  609.15  734.85 1433.0   100   c

Note that you can make your `polars` code look like tidyverse:

``` r
dd_po $
  select('Children') $
  sum()
```

    ## shape: (1, 1)
    ## ┌──────────┐
    ## │ Children │
    ## │ ---      │
    ## │ i64      │
    ## ╞══════════╡
    ## │ 10523    │
    ## └──────────┘

With the `select` method you can do arithmetic. `data.table` is fastest.

``` r
microbenchmark::microbenchmark(
 'polars' = {
   dd_po$
      select(pl$col('Children') ^ 2)
 },
 'polars lazy' = {
   dd_po$
     lazy()$
     select(pl$col('Children') ^ 2)$
     collect()
 },
 'data.table' = {
   dd_dt[, Children ^ 2]
 }
)
```

    ## Unit: microseconds
    ##         expr   min     lq    mean median      uq    max neval cld
    ##       polars 592.2 759.35 937.684 913.15 1047.10 2041.6   100  a
    ##  polars lazy 599.2 759.50 951.802 904.50 1027.05 4162.8   100  a
    ##   data.table 289.0 418.05 503.875 487.15  548.25 1027.5   100   b

You can apply aggregations by groupings. `polars` is clearly faster.

``` r
microbenchmark::microbenchmark(
  'polars'= {
    dd_po$
      groupby('Sex')$
      agg(pl$count(),
          pl$col('Age')$mean())
    # NB dd_po$groupby('Sex')$count() did not work for me
  },
  'polars lazy'= {
    dd_po$
      lazy()$
      groupby('Sex')$
      agg(pl$count(),
          pl$col('Age')$mean())$
      collect()
  },
  'data.table' = {
    dd_dt[, mean(Age), Sex]
  }
)
```

    ## Unit: microseconds
    ##         expr    min     lq     mean  median      uq     max neval cld
    ##       polars  900.6 1117.8 1473.581 1368.05 1667.05  2877.8   100  a
    ##  polars lazy  931.4 1115.8 1574.055 1386.55 1699.25  6072.2   100  a
    ##   data.table 1750.1 2227.7 3043.317 2575.05 3234.10 10125.1   100   b

`polars` was faster for applying a function to filtered values, though
the code is starting to resemble the worst type of tidyverse or pandas
code to me - the `data.table` code is a thing of beauty and simplicity
in comparison.

``` r
microbenchmark::microbenchmark(
  'polars' = {
    dd_po$
      filter(pl$
               col('Sex')$
               str$
               contains('Male'))$
      select('Children')$
      sum()
  },
  'polars lazy' = {
    dd_po$
      lazy()$
      filter(pl$
               col('Sex')$
               str$
               contains('Male'))$
      select('Children')$
      sum()$
      collect()
  },
  'data.table' = {
    dd_dt[Sex %in% 'Male', sum(Children)]
  }
)
```

    ## Unit: milliseconds
    ##         expr    min      lq     mean  median     uq    max neval cld
    ##       polars 2.5272 3.00085 3.404755 3.33485 3.7385 6.1626   100 a
    ##  polars lazy 1.2505 1.49705 1.776377 1.64650 1.9012 6.9724   100  b
    ##   data.table 1.7016 2.08345 2.379780 2.20760 2.5546 5.4575   100   c

Below is my first attempt to add a column, by selecting all the existing
columns and adding a new conditional field derived from another
variable, but it doesn’t make the changes “in place” and I would need to
reassign to the object, which might be slow.

``` r
dd_po$
  lazy()$
  select(
    pl$all(),
    pl$when(
      pl$col('Age') > 16)$
        then('Adult')$
        otherwise('Child')$
      alias('agegrp')
)$
  collect()
```

    ## shape: (5000, 13)
    ## ┌──────┬──────────┬────────────┬─────┬─────┬──────────┬────────────┬───────┬────────┐
    ## │      ┆ Name     ┆ DOB        ┆ Age ┆ ... ┆ Children ┆ Employment ┆ Death ┆ agegrp │
    ## │ ---  ┆ ---      ┆ ---        ┆ --- ┆     ┆ ---      ┆ ---        ┆ ---   ┆ ---    │
    ## │ i64  ┆ str      ┆ str        ┆ i64 ┆     ┆ i64      ┆ str        ┆ bool  ┆ str    │
    ## ╞══════╪══════════╪════════════╪═════╪═════╪══════════╪════════════╪═══════╪════════╡
    ## │ 1    ┆ Angely   ┆ 2010-02-05 ┆ 29  ┆ ... ┆ 0        ┆ Full Time  ┆ false ┆ Adult  │
    ## │ 2    ┆ Raelyn   ┆ 2008-07-24 ┆ 71  ┆ ... ┆ 1        ┆ Full Time  ┆ true  ┆ Adult  │
    ## │ 3    ┆ Breale   ┆ 2009-01-26 ┆ 75  ┆ ... ┆ 1        ┆ Full Time  ┆ true  ┆ Adult  │
    ## │ 4    ┆ Earth    ┆ 2009-12-26 ┆ 68  ┆ ... ┆ 1        ┆ Student    ┆ false ┆ Adult  │
    ## │ ...  ┆ ...      ┆ ...        ┆ ... ┆ ... ┆ ...      ┆ ...        ┆ ...   ┆ ...    │
    ## │ 4997 ┆ Sherah   ┆ 2008-09-01 ┆ 55  ┆ ... ┆ 2        ┆ Full Time  ┆ true  ┆ Adult  │
    ## │ 4998 ┆ Salbador ┆ 2010-03-15 ┆ 65  ┆ ... ┆ 3        ┆ Full Time  ┆ true  ┆ Adult  │
    ## │ 4999 ┆ Keavion  ┆ 2008-08-04 ┆ 67  ┆ ... ┆ 0        ┆ Full Time  ┆ false ┆ Adult  │
    ## │ 5000 ┆ Anacely  ┆ 2009-07-01 ┆ 76  ┆ ... ┆ 1        ┆ Unemployed ┆ true  ┆ Adult  │
    ## └──────┴──────────┴────────────┴─────┴─────┴──────────┴────────────┴───────┴────────┘

Apparently `with_column`/`with_columns` is the correct approach, though
this would also seem to return a new DataFrame requiring reassignment.
Yet `polars` is still almost as fast as `data.table`.

``` r
microbenchmark::microbenchmark(
  'polars lazy' = {
    dd_po <- dd_po$
      lazy()$
      with_column(
        pl$when(
          pl$col('Age') > 16)$
            then('Adult')$
            otherwise('Child')$
          alias('agegrp')
      )$
      collect()
  },
  'data.table' = {
    dd_dt[, agegrp := ifelse(Age > 16, 'Adult', 'Child')]
  }
)
```

    ## Unit: milliseconds
    ##         expr min      lq     mean median      uq    max neval cld
    ##  polars lazy 1.6 1.97725 2.247649 2.1671 2.48025 4.0360   100   a
    ##   data.table 1.6 1.95320 2.230975 2.1003 2.43435 4.5123   100   a

In summary, `polars` is an exciting development with a number of
features enabling speed, but at least for the data sets I typically work
with, may not yet offer must-have advantages over `data.table`, and
there are still a few rough edges here and there. I will continue to
play with it and see how it performs for joins or reshaping, and if
there are better ways I can do any of the above things. But
`data.table`’s concise syntax still has me hooked for the moment.

Postscript: `data.table` does some optimised functions such as `%chin%` and `fifelse` which I did briefly look at, but which did not seem to have a major impact on relative timings.

More info here:

- [An Introduction to Polars from R •
  polars](https://rpolars.github.io/articles/polars.html)
- [Introduction - Polars - User Guide](https://pola-rs.github.io/polars-book/user-guide/introduction.html)

``` r
sessionInfo()
```

    ## R version 4.2.3 (2023-03-15 ucrt)
    ## Platform: x86_64-w64-mingw32/x64 (64-bit)
    ## Running under: Windows 10 x64 (build 19045)
    ##
    ## Matrix products: default
    ##
    ## locale:
    ## [1] LC_COLLATE=English_United Kingdom.utf8
    ## [2] LC_CTYPE=English_United Kingdom.utf8
    ## [3] LC_MONETARY=English_United Kingdom.utf8
    ## [4] LC_NUMERIC=C
    ## [5] LC_TIME=English_United Kingdom.utf8
    ##
    ## attached base packages:
    ## [1] stats     graphics  grDevices utils     datasets  methods   base
    ##
    ## other attached packages:
    ## [1] polars_0.5.0.9000 data.table_1.14.8
    ##
    ## loaded via a namespace (and not attached):
    ##  [1] pillar_1.9.0         compiler_4.2.3       tools_4.2.3
    ##  [4] digest_0.6.31        evaluate_0.20        lifecycle_1.0.3
    ##  [7] tibble_3.2.1         lattice_0.20-45      pkgconfig_2.0.3
    ## [10] rlang_1.1.0          Matrix_1.5-4         cli_3.6.1
    ## [13] rstudioapi_0.14      microbenchmark_1.4.9 yaml_2.3.7
    ## [16] mvtnorm_1.1-3        xfun_0.39            fastmap_1.1.1
    ## [19] dplyr_1.1.2          knitr_1.42           generics_0.1.3
    ## [22] vctrs_0.6.2          wakefield_0.3.6      grid_4.2.3
    ## [25] tidyselect_1.2.0     glue_1.6.2           R6_2.5.1
    ## [28] fansi_1.0.4          survival_3.5-5       rmarkdown_2.21
    ## [31] multcomp_1.4-23      TH.data_1.1-2        magrittr_2.0.3
    ## [34] codetools_0.2-19     htmltools_0.5.5      splines_4.2.3
    ## [37] MASS_7.3-59          sandwich_3.0-2       utf8_1.2.3
    ## [40] zoo_1.8-12
```


