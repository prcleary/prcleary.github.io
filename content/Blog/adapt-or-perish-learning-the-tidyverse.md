---
title: "Adapt or perish: learning the tidyverse"
date: 2023-06-12
tags:
  - R
  - Writing
---

> [!quote] "Adapt or perish, now as ever, is nature's inexorable imperative." 
> - H.G. Wells

I am now reading [Tidyverse Skills for Data Science in R by Roger D. Peng et al](https://leanpub.com/tidyverseskillsdatascience).
To be honest I don't want to learn the tidyverse, and don't need to learn it, and have some issues with it, but I have decided it would be useful to understand it better for teaching purposes.

I recognise that the tidyverse provides a set of packages with consistent syntax that make it easier to learn R (up to a point), compared to base R and other options such as `data.table`. It's definitely been a key factor in the success of R. If I was learning R today I would probably be learning the tidyverse. But I have some other thoughts I need to get out of my system.

I have an issue with the name. It should really be called the Positverse. From some of the things I have read, you would think that Hadley Wickham had invented data in tabular formats with variable names at the top (which is apparently now called "tidy data"), and also invented data cleaning (sorry, "tidying").

I also have an issue with the syntax. It's a dead end, like Stata, giving you transferable competence to zero other programming languages. Also like Stata, it is easy to do easy things and then massively harder to do hard things (because you have learned no complex problem-solving skills and in fact have been led to believe that you only need one data structure and one type of algorithm to do everything).

The tidyverse constantly reinvents the wheel, repackaging other functions just so that it can get the totemic word "tidy" in there somewhere. It's like a cult.

It encourages poor dependency management - the tidyverse metapackage pulls in about 20 packages and then people often add at least another 10 to that. They have had to produce another package called `conflicted` to handle the fact that several of the tidyverse packages have functions with the exact same names.

It can be really *slow*, though [there are now tidyverse packages which address this](https://www.tidyverse.org/blog/2023/04/performant-packages/).

I have often regarded the tidyverse as like [Scratch](https://scratch.mit.edu/), hiding real programming behind a childishly simple interface - which is fine so long as at least some of those kids grow up to learn to code properly. There is even a tidyverse package called `here`, catering to people who don't understand the working directory concept, or how to double-click on RStudio project files.

Nevertheless, I have started to learn the tidyverse. So far the book has taken me through the many different tidyverse and "tidyverse adjacent" packages (e.g. `readxl`, `haven` and `lubridate`, which are very useful whether you use tidyverse or not). I have just read about tibbles and completely failed to see the point of them, though perhaps that is explained later.

Clearly the tidyverse is addressing a gap in the market. Python is easier to learn (and what they teach, badly, in schools); however R has more of the good stuff for many of us, yet is let down by its quirky default programming language. I wonder if there wasn't some way to repackage R syntax in a more Pythonic way, rather than to invent something else.

Anyway, that was therapeutic for me if not for you.



