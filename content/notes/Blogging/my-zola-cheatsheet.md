+++
title = "My Zola cheatsheet"

[extra]
mermaid = true
+++

{{ toc() }}

Most Markdown works as expected, but here are some less obvious things you can do. You can also include HTML.

## Add a table of contents

```markdown
{{/* toc() */}}
```

{{ toc() }}

More options here: [~/tabi • Table of Contents](https://welpo.github.io/tabi/blog/toc/)

## Reference links

```markdown
[Zola][zola]

[zola]: https://www.getzola.org
```
[Zola][zola]

[zola]: https://www.getzola.org

## Internal links

```markdown
[Link to this page](@/notes/Blogging/my-zola-cheatsheet.md)
```

[Link to this page](@/notes/Blogging/my-zola-cheatsheet.md)

## Images with labels on hover

```markdown
![Sardinia climbing](https://climbingitaly.com/sector-img/pedra-longa-1.jpg "Want to go there") 
```

![Sardinia climbing](https://climbingitaly.com/sector-img/pedra-longa-1.jpg "Want to go there") 

## Footnotes

```markdown
This is a sentence which appears here.[^1]

[^1]: This is the footnote which appears at the end.
```

This is a sentence which appears here.[^1]

[^1]: This is the footnote which appears at the end.

## YouTube shortcode

Shortcodes allow you to define shortcuts for HTML snippets or loading data

More shortcodes here: [~/tabi • Custom shortcodes](https://welpo.github.io/tabi/blog/shortcodes/)

(See source code for how to escape shortcodes)

```markdown
{{/* youtube(id="5BYxzH9uBRg") */}}
```

{{ youtube(id="5BYxzH9uBRg") }}

## Callout shortcode

```markdown
{%/* admonition(type = "tip") */%}
This is important
{%/* end */%}
```

{% admonition(type = "tip") %}
This is important
{% end %}

Available types: `note`, `tip`, `info`, `warning`, `danger`


## Aside shortcode

```markdown
{%/* aside(position = "right") */%}
This is an aside
{%/* end */%}
```

{% aside(position = "right") %}
This is an aside
{% end %}

## Remote text shortcode

````markdown
```r
{{/* remote_text(src="https://raw.githubusercontent.com/prcleary/rename_pdf/refs/heads/master/rename_pdf.R") */}}
```
````

```r
{{ remote_text(src="https://raw.githubusercontent.com/prcleary/rename_pdf/refs/heads/master/rename_pdf.R") }}
```

## Mermaid diagram shortcode

Need to add `mermaid = true` in `[extra]` section of frontmatter

```markdown
{%/* mermaid(invertible = true, full_width = true) */%}
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
{%/* end */%}
```

{% mermaid() %}
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
{% end %}
  
## Spoiler shortcode

```markdown
*... and the murderer was {{/* spoiler(text="the podiatrist", fixed_blur=false) */}}!*
```

*... and the murderer was {{ spoiler(text="the podiatrist", fixed_blur=false) }}!*

## KaTeX for formulas

```markdown
$y = \frac{x^3}{z}$
```

$y = \frac{x^3}{z}$

## Emoji examples

| code | emoji |
|------|-------|
|`:rocket:`| :rocket: |
|`:smile:`| :smile: |
|`:rofl:`| :rofl: |
|`:sunglasses:`| :sunglasses: |

More here: [ikatyang/emoji-cheat-sheet: A markdown version emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet/)

## Useful links: 

- Tera, the syntax used for shortcodes: [Tera](https://keats.github.io/tera/docs/#default)
- Zola discourse group: [Zola](https://zola.discourse.group/)

---


