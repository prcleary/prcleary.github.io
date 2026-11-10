---
title: My Vim cheatsheet
date: 2022-11-08
tags:
  - Vim
  - Cheatsheet
---

### Move all lines matching pattern to start of file

```vim
:g/pattern/m0
```

### Revert to previous versions of file

May depend on your undo settings

```vim
:earlier 5m  " revert to version 5 minutes ago
:earlier 2f  " revert to last save before last
:later 1h  " revert to 1 hour later version
```

### Show lines containing "this" but not "that" or "the other"

```vim
:g/this\C/v/that\C/v/the other/#
```
