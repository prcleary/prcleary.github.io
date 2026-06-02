---
title: Formatting in Quarto
date: 2022-11-01
tags:
  - Quarto
---

````
---
title: "Quarto evaluation"
format: html
from: markdown+emoji
tbl-cap-location: bottom  # default top; margin doesn't work
reference-location: margin  # footnotes
citation-location: margin
citations-hover: true
fig-cap-location: margin
---

Using Visual Studio Code with vscodevim

Word and HTML output seemed to work

- but not PDF until I installed `texlive-latexextra`

| Default | Left | Right | Center |
|---------|:-----|------:|:------:|
| 12 | 12 | 12 | 12 |
| 123 | 123 | 123 | 123 |
| 1  | 1    |     1 |   1    |

: Demonstration of pipe table syntax; don't have to be aligned

| Narrow| Wide |
|---|---------|
|   2   | word word word word word word word word word word word word word word |

: The number of dashes does matter

- This
- is a
- narrow
- list

- This

- is a

- wide

- list

I can't see a difference between narrow and wide lists.

1. This
1. is a
1. numbered
1. list

Emojis: :grinning: (don't work in PDF)

| Another | table |
|--|--|
| Cell 1 | Cell 2 |

: The caption {tbl-colwidths="[10, 90]"}

| Col1 | Col2 | Col3 |
|------|------|------|
| A    | B    | C    |
| E    | F    | G    |
| A    | G    | G    |

: My Caption {#tbl-letters}

See @tbl-letters.

::: {#tbl-panel layout-ncol=2}
| Col1 | Col2 | Col3 |
|------|------|------|
| A    | B    | C    |
| E    | F    | G    |
| A    | G    | G    |

: First Table {#tbl-first}

| Col1 | Col2 | Col3 |
|------|------|------|
| A    | B    | C    |
| E    | F    | G    |
| A    | G    | G    |

: Second Table {#tbl-second}

Main Caption
:::

See @tbl-panel for details, especially @tbl-second.

Here is some R code.

```{r testchunk}
a <- 3
a
```

```{r}
#| tbl-cap: "Cars"
#| tbl-colwidths: [60,40]

library(knitr)
kable(head(cars))
```

```{r}
#| label: fig-cap-margin
#| fig-cap: "MPG vs horsepower, colored by transmission."
#| cap-location: margin

library(ggplot2)
mtcars2 <- mtcars
mtcars2$am <- factor(
  mtcars$am, labels = c('automatic', 'manual')
)
ggplot(mtcars2, aes(hp, mpg, color = am)) +
  geom_point() +  geom_smooth(formula = y ~ x, method = "loess") +
  theme(legend.position = 'bottom')
```

Next bit only works in HTML
```{r}
#| column: screen-inset-right

# library(leaflet)
# leaflet() %>%
# addTiles() %>%  # Add default OpenStreetMap map tiles
# addMarkers(lng=174.768, lat=-36.852, popup="The birthplace of R")
```

```{r}
#| column: page-inset-right

plot(cars)
```

::: {.column-margin}
This content will appear in the margin!
:::


````

