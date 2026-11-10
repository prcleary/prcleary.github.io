---
title: "k-anonymising data sets with the sdcMicro Shiny app"
date: 2023-04-14
tags:
  - R
  - Shiny
---

I am currently involved in going through our organisational approvals process for sharing some anonymised case-level disease data with a research partner.

Even after you have removed all direct identifiers such as name, telephone number or email address, there can remain a risk of *deductive disclosure*, which you would clearly want to minimise.

Deductive disclosure (aka statistical disclosure, the "jigsaw" effect or the "mosaic" effect) is when confidential data is released into the public domain without any directly identifying information, but someone else (e.g. an enterprising journalist or student) is able to work out who is who in the data using information on people available from another sources.

![Deductive disclosure](deductive-disclosure.jpg)

This has apparently happened, in the US at least. Apparently 87% of US citizens can be uniquely identified using only the variables zip code (to 5 digits - apparently they can have an extra 4 digits), gender and date of birth.

Variables like gender and date of birth are called *quasi-identifiers*.

> Quasi-identifiers are attributes that in combination can lead to the disclosure of the identity of individuals (a privacy threat termed identity disclosure, or reidentification), such as demographics.

Risk of deductive disclosure has occasionally been used by governments as a reason to refuse freedom of information requests.

More commonly, it is why we tend to aggregate data for publication and mask any small counts (e.g. <5).

In the interests of transparency though (and also of being a good research partner), we sometimes need to share more granular data, which still protecting the privacy of individuals.

There is a balance to be struck. You could simply drop any variables that might lead to deductive disclosure, but this might also remove useful information unnecessarily.

There are alternative ways of minimising risk of deductive disclosure while maintaining the informational value of the data set. A number of algorithms have been developed which can alter data to minimise risk while preserving information.

The most popular method for protecting data from reidentification aims to achieve *k-anonymity*, in which there are no combinations of quasi-identifiers occurring in the data less than a specified number of times. For k=3 anonymity, there would be no fewer than 3 males aged 20-29, no fewer than three females aged 30-39 living in a particular area, no fewer than three males of Albanian origin aged 60-69 living in a particular area, and so on for every combination.

The algorithm achieves k-anonymity by replacing infrequent values of categorical variables with missing values.

So for the Albanian example above, if there were only 2 individuals with that combination, it would replace values of those variables with missing until k=3 anonymity was achieved.

By default the algorithm will start with the variable with the most values (here probably country of origin) and change that value to missing for the 2 individuals, then check to see if k-anonymity was achieved, and if not, repeat the process with other quasi-identifiers until it is achieved.

I can see a possible weakness in this approach if you were to use it for data from large or total samples of the population (or of subpopulations). You might achieve k=3 anonymity in the data, but if in the population there only existed three individuals with a given combination of quasi-identifiers, and their records were identical in terms of the sensitive data fields, then at least theoretically it might be possible to reidentify them and their sensitive information.

There are other methods for statistical disclosure control which can be used as alternative approaches or in combination. Some of these can be used for continuous variables, or for direct identifiers. From my reading these methods include:

- PRAM (post-randomisation, which randomly changes some values)
- microaggregation (which replaces a continuous variable with an aggregate statistic)
- top/bottom coding (which recodes the highest/lowest values to something else)
- rounding
- addition of random noise
- numerical rank swapping (swapping values of similarly ranked continuous variables)
- shuffling (randomly shuffling values of a variable while maintaining the relationship between variables)
- pseudonymising/hashing identifiers (hashing is a sort of one-way encryption)
- creating new random identifiers

The [`sdcMicro` R package and Shiny app](https://cran.r-project.org/web/packages/sdcMicro/sdcMicro.pdf) implements all of these methods for **s**tatistical **d**isclosure **c**ontrol in record-level data (which they call "**Micro**data").

`sdcMicro` seems to be the most comprehensive offering and also may be the most efficient tool. Even so, some of these methods can be computationally intensive, and can take hours or even days to run for a sufficiently large data set. There is another software tool called μ-Argus which provides most of the same methods.

We had several tens of thousands of records to anonymise, from a population of tens of millions. The data request specified which fields were required, so we started with that. No direct identifiers were requested.

We removed some variables which were requested but for which there was no justification for sharing in the study protocol, including small area identifiers such as LSOA and MSOA.

Next step was to identify which quasi-identifiers remained in the data, such as demographics. Taking a risk-averse approach there were about a dozen of these.

The next step is to get your data into the `sdcMicro` Shiny app (hopefully by now no one panics when they see data in a locally-running Shiny app).

You can load your data directly into the app and do your data preparation in the app, but I did it in R first. You need to make sure that all your quasi-identifiers (which `sdcMicro` calls "key variables") are of either factor or numeric type. You may also wish to convert certain numeric key variables to factor (I did this for year and week of death).

I got weird errors when trying to get `sdcMicro` to ingest the data in `data.table` format, so stuck to using data frames. You may have better luck with tibbles.

You can load your data set into memory in R before running the app, i.e. something like this:

```r
library(sdcMicro)
mydata <- read.csv('thedata.csv')
sdcApp(debug = TRUE)  # or e.g. output <- sdcApp() if you want to save the output
```

I have been running the app with `debug=TRUE` so that you can see more verbose output in the console (sometimes reassuring when things are slow).

The app should now open. You will see the following tabs:

- **About/Help**: some information on the app; it's also where you can specify where things will be saved, and stop the app if necessary
- **Microdata**: where you select a data set in memory, or load data from a file, and can then explore your data with basic tabulations or charts; you can make a number of basic modifications to the data if you haven't already; you can also select a subset of the data (useful when testing with a large data set)
- **Anonymize**: where you indicate which of your variables are quasi-identifiers (categorical or numeric) to "set up your SDC problem"; you can also delete variables; once the SDC problem is set up, you are shown a number of anonymisation methods; if you go for k-anonymity then you can specify the "importance" of each quasi-identifier (on a scale of 1 to 10; an importance of 10 means the algorithm will start there replacing values with missing; an importance of 1 means this variable won't have values replaced with missing until the other variables have been looked at); click "Establish k-anonymity" when ready and then go and do something else
- **Risk/Utility**: shows a whole range of risk measures and other things that I haven't fully explored yet
- **Export Data**: export your anonymised data in a number of formats; you can also export basic/detailed reports of what was done
- **Reproducibility**: export an R script for actions you have done in the app; you can also export an .Rdata object containing the state of the app (or import a previously saved one)
- **Undo**: undo the last step you did in the app

There are lots of other options which I haven't fully explored yet. For a data set of several tens of thousands rows, with about a dozen quasi-identifiers, it took a couple of hours on my work machine (64GB RAM). I then exported the data and the state of the app; also the R script, though I found this needed some modification to make it run. I hope this means the data will be shared soon!

There is full documentation of the app [here](https://sdcpractice.readthedocs.io/en/latest/intro.html). I also found [this article](https://econpapers.repec.org/scripts/redir.pf?u=https%3A%2F%2Fdoi.org%2F10.31219%252Fosf.io%252F2fvj7;h=repec:osf:osfxxx:2fvj7) useful.


