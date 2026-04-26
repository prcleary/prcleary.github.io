---
title: Setting up Emanote
date: 2026-04-26
---

This is how to set up Emanote on a Linux computer (Pop!\_OS) to create a blog to host on GitHub Pages, i.e. this one. 

> [!warning] This is a very big installation (gigabytes)

---

## Installing Nix (Linux)

Follow the official instructions at  
[Installing – Emanote](https://emanote.srid.ca/install)

It is apparently feasible on Windows (via WSL) but I haven't tried it.

The following commands worked for me:

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://artifacts.nixos.org/experimental-installer | sh -s -- install --no-confirm --extra-conf "trusted-users = $(whoami)"
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf  # restart your terminal after this line
nix run nixpkgs#omnix -- health  # got a couple of warnings but OK to ignore them
```

---

## Install Emanote

```bash
nix profile install github:srid/emanote  # answer "y" to questions
```

Check installation:

```bash
emanote --version
```

---

## Create Blog Structure

```bash
cd
mkdir emanote              # Folder for project
cd emanote
mkdir content docs         # content = Markdown, docs = compiled site (GitHub Pages expects this)
cd content
emanote run
```

You can also create folders for templates and other assets (but you can do this later):

- `templates/` – custom layouts
- `static/` – static assets (images, CSS, etc.)

Emanote runs a local server and prints a URL such as:

```
http://127.0.0.1:34043
```

Open this in your browser. It live-reloads as you edit files.

---

## Create the home page

Create the following file with the text editor of your choice:

```
~/emanote/content/index.md
```

Add Markdown for your welcome page. Mine currently looks like this:

```markdown
---
title: Wikipaulia
---

Welcome! I'm **Paul Cleary**, a UK epidemiologist working in public health and global health. My technical interests include statistics, coding, open source software, self-hosting, global health informatics and AI.

## What you'll find here

- My[[Blog|blog]]
- Occasional[[Writing|writing]]
- Interesting[[Bookmarks|bookmarks]]
- Notes (e.g. on[[Books|reading]]) which I am starting to organise in Obsidian

[Email](mailto:blog@paulcleary.net) [GitHub](https://github.com/prcleary) [Letterboxd](https://letterboxd.com/rusticana/) [ORCID](https://orcid.org/0000-0001-9335-5422) [Strava](https://www.strava.com/athletes/9125693) [Zotero](https://www.zotero.org/drprcleary)

[Old blog](static/oldblog.html)

<p style="white-space:nowrap;" xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://prcleary.github.io">Wikipaulia</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://prcleary.github.io">Paul Cleary</a> is marked with <a href="https://creativecommons.org/publicdomain/zero/1.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline;">CC0 1.0<img style="display:inline!important;height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="display:inline!important;height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/zero.svg?ref=chooser-v1" alt=""></a></p>
```

There's YAML metadata at the start (other possible fields include date in YYYY-MM-DD format), then it's mostly standard Markdown. 

You can link to another page by using the filename of the source Markdown file, without the ".md" file ending. You don't need to specify a path as Emanote will find the file that is nearest in the hierarchy with that name. So to link to my blog page (Blog.md), I can use `[[Blog]]`, or `[[Blog|blog]]` if I want the link to show "blog". Note that there is a bit of extra space around links, so you may not need to add a space, e.g. `My[[Blog|blog]]`.

---

## Configure `index.yaml`

Copy the default config from: <https://raw.githubusercontent.com/srid/emanote/refs/heads/master/emanote/default/index.yaml>

Place it in:

```
~/emanote/content/index.yaml
```

Useful changes:

- Change `theme` (see Tailwind color palette: <https://tailwindcss.com/docs/colors#default-color-palette>)  
  Example: `neutral`, `blue`, `slate`, `stone`, etc.
- Set:
  ```
  siteTitle: Wikipaulia
  siteUrl: https://yourusername.github.io/repository-name/
  ```
- Enable Mermaid and MathJax.

Add:

```
bodyHtml: |
  <snippet var="js.mermaid" />
  <snippet var="js.mathjax" />
```

This enables:

- Mermaid diagrams (flowcharts, graphs)
- LaTeX math rendering

Do not put `#`-prefixed comments in config values — they can be interpreted as tags.

---

## Folder Structure and “Folder Notes”

Add subfolders as needed, for example:

```
content/
  Blog/
    2023-03-08.md
```

Outside each subfolder create a *folder note* to replace default folder content:

```
Blog.md
```

This file sits alongside the `Blog/` directory.

Alternatively use:

```
Blog/index.md
```

Folder notes are useful for:

- Section introductions
- Custom ordering
- Tag summaries

---

## Front Matter for blog pages

Structure pages using YAML front matter:

```yaml
---
title: Forwarding ssh-agent through WebSockets
date: 2023-03-08
order: -5
slug: forwarding-ssh-agent-through-websockets
tags:
  - haskell
  - blog
---
```

Notes:

- Use ISO date format: `YYYY-MM-DD`
- Filename convention like `2023-03-08.md` works well for chronological sorting
- `order` controls sidebar positioning (lower = higher up)
- `slug` controls URL
- `tags` enable backlinks and filtering

Dates are not shown unless 
---

## Build the Site

From the project root:

```bash
emanote -L content/ gen docs/
```

Or:

```bash
cd emanote/content
emanote gen ../docs/
```

The `docs/` folder is required for GitHub Pages if publishing from `/docs`.

---

## Export Everything to a Single Markdown File

```bash
emanote export content
```

Useful for:

- Backups
- Converting to other static site generators
- Printing

You can also export config with `emanote export`.

---

## Publish to GitHub Pages

Typical workflow:

```bash
cd emanote
vim content/path/filename.md
emanote -L content/ gen docs/
git add .
git commit -m "Add content"
git push
```

Configure GitHub Pages to serve from:

- Branch: `main`
- Folder: `/docs`

There is no heavy build pipeline — generation is fast and local.

---

## RSS Feeds

Emanote supports RSS generation (see official documentation).  
Ensure:

- `siteUrl` is set correctly.
- Pages include `date:` in front matter.

RSS is typically generated automatically during `gen`.

---

## Search (Ctrl-K)

Emanote includes built-in search powered by Stork.  
Press:

```
Ctrl-K
```

to open the search dialog.

Search behavior can be adjusted in `index.yaml` under the `stork:` section.

There are tips in the Emanote documentation or among the GitHub Issues to:

- change the default fonts
- show dates in pages

Have a look at the source of my blog to see how that is done. 


