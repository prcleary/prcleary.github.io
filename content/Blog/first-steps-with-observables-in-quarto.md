---
title: First steps with Observables in Quarto
date: 2022-10-29
tags:
  - Observables
  - Quarto
---

## General

- Need to render whole document (i.e. not interactive)
- each cell is separate JavaScript script
- errors only affect affected cell
- ? semicolon required after each statement

- ? risk of deductive disclosure if whole data embedded
- [could add button to read in file](https://observablehq.com/@a10k/read-local-txt-file-from-an-observable-notebook)

## Adding CSS

````markdown
```{ojs}
html`<style>
h1 {
  color: #006600;
}
</style>`
```
````

## Reading data from R

- `ojs_define` function can be used in R or Python

````markdown
```{r}
library(data.table)
mydatainr <- fread('data.csv')
ojs_define(mydatainojs = mydatainr)
```
````

- [NB: need to transpose](https://www.infoworld.com/article/3674789/a-beginners-guide-to-using-observable-javascript-r-and-python-with-quarto.html)
- chunk options prefixed by `//|`
- hard to override `<-` muscle memory!

````markdown
```{ojs}
//| echo: true
mydata = transpose(mydatainojs)
// Remember to transpose
mydata
```
````

## Reading data from local file

````markdown
```{ojs}
mydata2 = FileAttachment("data.csv").csv({typed: true })
mydata2
```
````

- alternatively read data directly (no need to transpose it seems)
- `FileAttachment` presumably in `stdlib` so no need to import
- core libraries are `stdlib`, Inputs and Plot
- other JS libraries require importing
- `typed: true` for type coercion
- NB: allow columns with same name

## Reading CSV data from Web or local file

````markdown
```{ojs}
mydata3 = d3.csv('data.csv')
mydata3
```
````

- no need to transpose
- no need to import d3 in Quarto
- similar method for JSON
- need to try with DHIS 2 API

## View data

````markdown
```{ojs}
Inputs.table(mydata3)
```
````

- no need to import Inputs in Quarto
- also has useful `.range`, `.checkbox` methods

## Dealing with duplicate variable names

- from [here](https://observablehq.com/@d3/parse-csv-with-duplicate-column-names) - removed the squiggle

````markdown
```{ojs}
function csvParseDuplicate(text, {empty = "_default", dedup = (name, j) => `${name}${j}`} = {}) {
  const columns = [];
  return Object.assign(d3.csvParseRows(text, (row, i) => {
    if (i === 0) {
      for (let name of row) {
        let n = name || (name = empty);
        let j = 0;
        while (columns.includes(n)) n = dedup(name, ++j);
        columns.push(n);
      }
      return;
    }
    return Object.fromEntries(columns.map((c, i) => [c, row[i]]));
  }), {columns});
}
mydata4 = FileAttachment('data.csv').text()
mydata5 = csvParseDuplicate(mydata4)
mydata5
```
````

- see below for how to handle spaces in variable names

## Converting to Arquero format

- [Arquero](https://uwdata.github.io/arquero/api/)

````markdown
```{ojs}
import {aq, op} from '@uwdata/arquero'
mydata6 = aq.from(mydata5)
mydata6.view()
```
````

## Data transformation

New column values

````markdown
```{ojs}
mydata7 = mydata6.derive({newdate: d => op.parse_date(d.Period)})
mydata7.view()
```
````

- note that you need to reassign

## Filtering and aggregation in Arquero

````markdown
```{ojs}
plot1data = mydata7
  .filter(d => d['Organisation unit1'] == 'Sindh')
  .groupby(['Organisation unit2', 'Data'])
  .rollup({
  mysum: op.sum('Value')
})
plot1data.view()
```
````

## Bar chart

- [`Plot` library does not work in RStudio it seems](https://github.com/juba/robservable/issues/46)
- "invalid module"
- but does work in browser

- `Plot.barY` for vertical columns
- `Plot.barX` for horizontal columns
- `marginLeft` to increase space for labels

````markdown
```{ojs}
Plot.plot({
  facet: {
    data: plot1data,
    y: 'Organisation unit2'
},
  marginLeft: 300,
  marginRight: 300,
  grid: true,
  height: 3000,
  marks: [
    Plot.barX(plot1data, {x: "mysum",
    y: "Data",
    fill: "#006600",
    sort: {y: "x", reverse: true}}),
    Plot.ruleY([0])
  ]
})
// FIXME overlapping axis label on right
```
````

## Variables

````markdown
```{ojs}
myvariable = 'hello world'
```
````

````markdown
```{ojs}
myvariable
```
````

## Resources

[Good cheatsheet](https://raw.githubusercontent.com/observablehq/plot-cheatsheets/main/plot-cheatsheets.pdf)

