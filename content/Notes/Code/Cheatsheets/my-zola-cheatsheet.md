---
id: 20251231120000
title: "My Zola cheatsheet"
aliases:
  - "Zola cheatsheet"
  - "Zola Markdown reference"
type: cheatsheet
category: tech
subcategory: zola
domain: web
tags:
  - tech/zola
  - tech/static-sites
  - tech/markdown
  - tech/web
  - reference/cheatsheet
  - status/active
created: 2025-12-31
modified: 2026-05-23
date: 2025-12-31
status: active
up: "[[Blogging]]"
---

# My Zola cheatsheet

> [!abstract] Summary
> Zola + tabi tricks beyond plain Markdown: tables of contents, internal links, callouts, asides, mermaid diagrams, KaTeX, emoji, and the shortcode escape syntax. Most of the shortcodes are tabi-provided, not Zola core.

> [!note] Setup assumptions
> This note assumes the [tabi](https://welpo.github.io/tabi/) theme. Many shortcodes below (admonition, aside, mermaid, spoiler, remote_text) come from tabi rather than Zola itself. The YouTube shortcode is built into Zola.

## Markdown enhancements

### Table of contents

Two ways. Either set in frontmatter to put it directly under the header:

```toml
[extra]
toc = true
```

…or place anywhere in the body for custom positioning:

```markdown
{{/* toc() */}}
```

More options (max depth, hiding headers, custom positioning): [tabi — Table of Contents](https://welpo.github.io/tabi/blog/toc/).

### Reference links

```markdown
[Zola][zola]

[zola]: https://www.getzola.org
```

### Internal links (Zola-specific)

The `@/` prefix tells Zola this is a content-relative path:

```markdown
[Link to this page](@/notes/Blogging/my-zola-cheatsheet.md)
```

### Images with hover tooltips

The title attribute (after the URL, in quotes) renders as a tooltip on hover. This is standard Markdown — works in any renderer.

```markdown
![Sardinia climbing](https://example.com/img.jpg "Want to go there")
```

### Footnotes

```markdown
This is a sentence which appears here.[^1]

[^1]: This is the footnote which appears at the end.
```

## Shortcodes

Shortcodes are HTML snippets / data-loading helpers defined as Tera macros. The `{{/* … */}}` and `{%/* … */%}` patterns below are the **escape syntax** — they prevent the shortcode from being executed in the source of this very note. Strip the `/*` and `*/` to actually invoke a shortcode.

More tabi shortcodes (image variants, code-block source paths, multilingual quotes, etc.): [tabi — Custom shortcodes](https://welpo.github.io/tabi/blog/shortcodes/).

### YouTube (Zola built-in)

```markdown
{{/* youtube(id="5BYxzH9uBRg") */}}
```

### Admonition (callout)

```markdown
{%/* admonition(type="tip") */%}
This is important
{%/* end */%}
```

Available types: `note`, `tip`, `info`, `warning`, `danger`. Optional `title` and `icon` arguments override the defaults.

### Aside (margin / side note)

```markdown
{%/* aside(position="right") */%}
This is an aside
{%/* end */%}
```

`position` defaults to `left`. On mobile it just renders as a block.

### Remote text

Embed contents of a remote URL or a local file (relative or absolute paths supported as of tabi 2.16.0). Wrap in code fences for syntax highlighting:

````markdown
```r
{{/* remote_text(src="https://raw.githubusercontent.com/.../rename_pdf.R") */}}
```
````

Optional `start` / `end` arguments for line ranges (both inclusive, 1-indexed).

### Mermaid diagram

Requires `mermaid = true` in the page or `config.toml` `[extra]` section to load the JS.

```markdown
{%/* mermaid(invertible=true, full_width=true) */%}
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
{%/* end */%}
```

Use the [Mermaid Live Editor](https://mermaid.live/) to draft diagrams.

### Spoiler

```markdown
*... and the murderer was {{/* spoiler(text="the podiatrist", fixed_blur=false) */}}!*
```

`fixed_blur=true` shows a fixed "SPOILER" placeholder instead of blurring the text itself.

## KaTeX (math)

> [!warning] Not a Zola native feature
> Zola does not render KaTeX out of the box ([feature request open in the forum](https://zola.discourse.group/)). It works here because tabi includes KaTeX with single-dollar inline delimiters and `$$…$$` block delimiters. If migrating to a different theme, this will break.

```markdown
$y = \frac{x^3}{z}$
```

## Emoji

> [!info] Requires config
> Emoji shortcodes only render if `render_emoji = true` is set in the top-level `[markdown]` section of `config.toml`.

| code | emoji |
|------|-------|
| `:rocket:` | 🚀 |
| `:smile:` | 😄 |
| `:rofl:` | 🤣 |
| `:sunglasses:` | 😎 |

Full reference: [ikatyang/emoji-cheat-sheet](https://github.com/ikatyang/emoji-cheat-sheet/).

---

## LINKS

### Up
- [[Blogging]] *(to write)*

### Related
- [[Static site generators compared]] — why I chose Zola
- [[My website]] *(to write)*
- [[Markdown cheatsheet]] *(to write)* — for the Markdown that works everywhere, not Zola-specific

### External references
- [Tera](https://keats.github.io/tera/docs/) — the templating language used in shortcodes and templates
- [tabi documentation](https://welpo.github.io/tabi/blog/) — the theme this site uses
- [Zola Discourse](https://zola.discourse.group/) — community forum
- [Zola docs](https://www.getzola.org/documentation/) — official
