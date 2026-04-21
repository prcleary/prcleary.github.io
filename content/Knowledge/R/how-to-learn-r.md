---
title: How to learn R (an opinionated view)
date: 2023-02-27
tags:
  - writing
---

So you would like to learn the statistical programming language R. You have decided this entirely of your own free will and without any undue coercion, conscious or unconscious, from me.

I applaud your decision. 

### Should you learn R?

R is widely used but is not not your only option. 

Reasons to learn and use R include:

- it has a broad range of statistical methods (probably unparalleled)
- it is free and open source software: R will always be available to you for free, wherever your career takes you; thousands of add-on packages are made available by other users
- it is very useful for public health and provides everything you need for outbreak investigation, surveillance, research, data science and your other analytical needs
- it has excellent data visualisation capabilities (including mapping)
- it can be used to generate excellent flexible and automatable reports of various types
- you can write Web apps in R code (called Shiny apps)
- it plays well with other open standards-based or open source software (and there is an extensive open source software ecosystem)
- it has a wide community of mutually supportive users and a vast amount of online learning material
- being good at a language like R feels like a kind of superpower

If your need is more for general purpose programming, machine learning or data engineering then you should perhaps learn Python instead (or as well). Python is also great and I will do some more on that at some point.

If your work is mainly with databases then you should focus on SQL (and probably more than one SQL dialect). R users would do well to learn at least some SQL. 

Depending on the industry or area you work in, or the languages that your collaborators use, there may be other languages that you should consider. Commercial statistical software such as SPSS, Stata or SAS often lags open source software in terms of development of capability, and it can be very expensive, but if you can already do everything you need with those tools and if your employer will pay for them then you need feel no pressure to learn R. 

### How hard is R to learn?

You must remember that R is a language rather than just software. 
You need to retain vocabulary, follow grammatical rules, appreciate semantics, and in return you gain richness and expressiveness.
And that all comes with time and practice.

R has a famously steep learning curve in the early stages, as in addition to learning the language you may also need to master concepts of statistics and computing. 
If your main aim is report production then it is possible to become a productive user of R without knowing much statistics, but you will still need to understand some basic computing concepts, as with any programming language.

Learning R is a process, not an event, and we are all just at different stages in that process. 

### How long does it take to learn R?

After approaching 20 years of using R there are still some aspects of R where my understanding remains superficial. I constantly have to look up solutions for things I have done previously in e.g. `ggplot2` or `data.table` - hence my growing cheatsheets. I have "learned R" only in that I now have the confidence that I can do just about everything I need to do with R, either from memory or by Googling things. But I will probably be learning R for the remainder of my career.

If you have experience of coding and apply yourself, focussing on the aspects of R that are most relevant to you, you can be productive in R within weeks or months. If you meet more than one of the following criteria:

- you are new to coding
- you only need to code infrequently (less than two hours per week on average)
- you don't really need R but you think it would be handy to know it
- you don't really want to learn R but think that you should
- you are waiting to be taught it
- you can do everything you need with other analytical tools

then it could take years. 

I always thought it would be helpful to have some knowledge of JavaScript, to be able to make Web pages more interactive etc, but after several online courses and reading one or more books over the years (and almost no real need to use it) I still couldn't sit down and write any useful JavaScript code from scratch.

### Which R should I learn?

Like any language, R has diversified into dialects: 

- base R (the basic R language that comes out of the box before any additional packages have been installed)
- the `tidyverse` of packages with consistent syntax, championed by RStudio/Posit and popular with beginners
- the `data.table` package, which enables you to write concise and super-fast running code

Base R is the equivalent of French with its clarity, subtlety and elegance, but also its difficulties and inconsistencies. In French "l'amour" is masculine in the singular ("l'amour fou"), but can be feminine in the plural ("les amours tarifées"). In R, the function to choose a directory is `choose.dir`, but the function to choose a file is `file.choose`. 

The `tidyverse` is the German of R: business-like, practical, verbose and fond of concatenation.

```r
mydata %>%
    do_this() %>%
    do_that() %>%
    do_something_else() %>%
    ad_infinitum() 
```

The German for "motor vehicle indemnity insurance" is `Kraft %>% fahrzeug %>% haftpflicht %>% versicherung`.

`data.table` is the [Toki Pona](https://en.wikipedia.org/wiki/Toki_Pona) of R: a linguistic experiment in concision, conceptually profound, with a minimal vocabulary (added to base R). This is how you do a left join in `data.table`:

```r
x[y]
```

To strain the metaphor further, Python is the English of R: easy to learn as a second language (to R), though complex in advanced use; idiomatic and used everywhere. 

You should regard any assertion that you only need one dialect with suspicion. Both the `tidyverse` and `data.table` are built on base R and complement it, which makes the things you occasionally hear from `tidyverse` overenthusiasts sound ridiculous (*We don't use base R* -> *Really? You don't use functions or vectors??*). See [here](https://github.com/matloff/TidyverseSkeptic) for much more on this. 

### The actual matter of learning R

In reality most people these days start off learning a mixture of base R, `tidyverse` and RMarkdown, probably also falling back frequently on analytical tools they used previously. At some point (possibly much later) it might become useful for them to learn some SQL, `data.table` and/or Python for more complex data tasks.

Your learning of R should in general be driven by what you need to do and what the people around you are doing. R can be overwhelming at first, but there are some basic capabilities that will be needed for pretty much anything you do, and you should focus on these first. I will try to outline these in a dialect-agnostic way below. 

In my view, it is helpful initially to learn these by way of a time-limited but non-business critical personal project that you can work on, ideally with some experienced supervision. This would ideally be done in parallel with any course you are undertaking. 

At first you will write a lot of terrible code, perhaps with lots of copying and pasting from Google, [Stack Overflow](https://stackoverflow.com/questions/tagged/r) or random Web pages, lots of repetition, excessive use of packages, poor formatting, no version control (apart from multiplication of files with a nomenclature that made sense at the time) and numerous other deviations from best practice. 
Don't beat yourself up about it. 
The real learning is by doing and making mistakes. 

Allow the pain points of this first project to determine what other learning materials you need to access. 
There are too many free resources on the Web for learning R for me to list here, but by honing your Web searching skills during this phase you should aim to learn the following first:

- How to install R and RStudio (assuming you will be running this all locally, that is on the machine in front of you, as opposed to in the cloud)
- How to run or close RStudio
- How to open and read R help files
- Where you type R code to run it interactively (e.g. `cat("I am cool!")`)
- How to create and save an R script in RStudio
- What the "working directory" concept means
- What relative and absolute paths are

Explore the menus and settings in RStudio during this phase - you are unlikely to break anything. Find some blogs, newsletters, social media or YouTubers with useful R content and follow the good ones. Learn how to ask good questions on forums. 

Most analytical code involves applying functions to data, that is, taking some data and making some calculations with it to derive something that is more useful than the data alone. In the next phase you should aim to learn the following through exploration of the openly available resources:

- What a *variable* is and how to create a variable (*assignment*)
- Which variable names are valid in R
- What the simplest data structures are in R (start with *vectors*), and how to create them
- The basic types of data that R can represent: numeric, character, date, logical; what a *factor* is; how to convert between data types; how R represents missing data and other special values
- How to use an R function
- The basic calculating functions that are available in base R; here are some to start with: `abs`, `sqrt`, `round`, `exp`, `log`, `cos`, `sin`, `tan`, `all`, `any`, `sum`, `min`, `max`, `range`
- What function arguments are and what default values are
- What an operator is; here are some to start with: `+`, `-`, `*`, `/`, `^`, `%%`, `&`, `|`, `!`, `==`, `!=`, `<`, `<=`, `>=`, `>`; understand operator precedence
- What the difference between a *statement* and an *expression* is
- How to combine functions and/or operators in a statement or expression
- How to read a comma-separated values (CSV) file of data into R
- How to filter your data to records meeting certain conditions
- Ways of viewing, summarising and checking data you have read into R
- How to create a simple frequency table
- How to run an R script containing several statements
- How to add comments to R scripts
- Understanding common error messages in R

Some of the above may vary depending on which dialect/s you are focussing on, e.g. the simple `data.frame` data structure in base R is replaced by a modified version in the other dialects. By the end of this phase you should aim to be able to replicate in R many of the basic calculations you can probably already do in a spreadsheet like Excel. 

From this point on things will often be done differently in different dialects, so at this point it is worth learning the following about R packages, which bring additional user-written functions and other goodness into R:

- How to install R packages
- How to include R packages in your code
- How to list the functions provided by a package
- How to update R packages

One of the most useful packages you will use irrespective of dialect is the `ggplot2` data visualisation package, so at this point you could start to learn how to create basic bar charts as a minimum.

Once you can create some basic tables and charts from data, it is time to start working on the quality and efficiency of your code by learning: 

- How to style R code in RStudio (check out the Ctrl-Shift-A keyboard combo in particular)
- How to write R functions: aim to write each function to do one thing well
- How to control the flow of your code using loops, `if`/`else` conditional statements and the like
- How to create and use RStudio Projects

At this point you should be ready to start to work with other coders. Working in a supportive team with other coders can be incredibly valuable and a time for accelerated learning. If you are required to run code for the team, make sure you have read that code and asked lots of stupid questions. 

Working in a team may mean you now need to learn the use of Git for version control and collaboration. Git can be hard to set up for a complete beginner, so seek help. Once Git is set up, you should first learn how to *clone* a Git repository and how to *pull* the latest changes from a Git repository. This is how you get the code and is often all you need until you become an active contributor to the project.

If you have reached this point and can say with confidence that you can do most of the things above (either from memory or with the help of Google), then congratulations! You are no longer a beginner. You can do more with R than I can do with JavaScript. You can start to teach others how to code. As an intermediate coder you can next learn whichever of the following are most useful to you:

- More complex data manipulations e.g. grouping, aggregating, converting between long and wide formats, joins/merges, using lookup files
- Running SQL queries on databases from R
- More complex data visualisations e.g. small multiples, maps, interactivity (e.g. `htmlwidgets`)
- Learning Markdown, as a preliminary step to learning RMarkdown
- Learning RMarkdown (a combination of R, Markdown and YAML) for creating documents in HTML or Microsoft Word formats, including simple dashboards
- Classical statistical tests: start with Student's $t$ test, the chi-squared test, Fisher's exact test, correlations, basic non-parametric tests, linear and logistic regression; sample size estimation can also be useful
- Debugging R code: useful commands such as `browser` and `debug`
- More advanced uses of Git: committing and pushing code changes, branching, fixing merge conflicts

Other more advanced areas you could then consider include:

- Creating an R package (with documentation and tests) and deploying it via GitLab/GitHub
- Creating more complex dashboards e.g. Shiny apps or using HTML/CSS/JavaScript directly
- More advanced statistical methods: multivariable models of different types; time series and forecasting; or, most advanced of all, Bayesian methods!
- Working with different types of data e.g. spatial, whole genome sequencing data, network data
- Running R in the cloud, perhaps in a container (Docker or podman) or a virtual machine (typically a Linux one), perhaps on a cloud platform like OpenShift (or Proxmox)
- Working with data APIs and pipelines
- Regular expressions to extract patterns from text
- If mastery is your goal, deepen your understanding of core R programming concepts: scope, environments, namespaces, non-standard evaluation, object-oriented and functional coding paradigms; learn about other languages and technologies
- If career progression is your goal, develop your broader skill set: technical leadership, management, soft skills; get a technical mentor

As well as doing more and more with R, you should also learn as much as you can about best practices which can help you produce robust, safe, maintainable, reusable, efficient code. 

R is always evolving and you will need to stay up to date. Save yourself time by collating useful snippets of code, your own cheatsheets, Web links and other helpful reference material. You could even write a blog and try to share useful stuff there. 

The best of luck to you.



