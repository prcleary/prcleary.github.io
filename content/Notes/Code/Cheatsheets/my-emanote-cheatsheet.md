---
title: "My Emanote cheatsheet"
tags:
  - Cheatsheet
  - Blogging
date: 2026-04-08
---

# My Emanote cheatsheet

> [!warning] Archived
> This cheatsheet documents [[Emanote]], which I used as the generator for an earlier version of this site. The site is now built with [[Quartz]] and the syntax differs in places — particularly around fenced divs, callouts, and embeds. Kept for reference; consult [[My Quartz cheatsheet]] for current usage.

> [!abstract] Summary
> Quick reference for Markdown extensions and conventions used in Emanote: frontmatter, Mermaid diagrams, code highlighting, internal links, math, tables, callouts, CSS classes, embeds, images, emoji, and attribute syntax for fenced divs.

Uses standard Markdown.

## Frontmatter

[... body unchanged ...]

## Local images

`![Ama Dablam](../static/ama-dablam.jpeg)`

![Ama Dablam](../static/ama-dablam.jpeg)

## Emoji

GitHub-style emoji shortcodes: see [Complete list of github markdown emoji markup](https://gist.github.com/rxaviers/7360908).

Example: `:rocket:` renders as 🚀.

## Adding classes etc to fenced divs

Emanote's fenced-div attribute syntax is documented in [commonmark-hs attribute extension](https://github.com/jgm/commonmark-hs/blob/master/commonmark-extensions/test/attributes.md).

Example — applying an id and a class to a heading:

```markdown
# Heading {#my-id .my-class}
```

And to a fenced div:

```markdown
::: {.my-class}
content
:::
```

---

## LINKS

- Emanote — <https://emanote.srid.ca/>
- Pandoc Markdown — <https://pandoc.org/MANUAL.html#pandocs-markdown>
- commonmark-hs attributes extension — <https://github.com/jgm/commonmark-hs/blob/master/commonmark-extensions/test/attributes.md>
- Obsidian callouts — <https://help.obsidian.md/callouts>
- GitHub emoji shortcodes — <https://gist.github.com/rxaviers/7360908>

