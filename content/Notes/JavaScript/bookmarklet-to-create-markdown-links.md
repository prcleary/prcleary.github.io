---
title: Bookmarklet to create Markdown links
date: 2022-11-19
tags:
  - JavaScript
---

Modified the existing TW bookmarklet from [here](https://techlifeweb.com/tiddlywiki/tw5tribalknowledge/static/Bookmarklet%2520for%2520pasting%2520links%2520into%2520TiddlyWiki.html).

This creates links in TiddlyWiki syntax i.e. `[[text|url]]`.

Examining it, it is just a bit of JavaScript encoded with URL escape characters:

```javascript
javascript:(function()%7Bjavascript%3Avoid(prompt(%22Copy%20the%20text%20below%20and%20paste%20into%20your%20TiddlyWiki%20to%20create%20a%20link%3A%22%2C%20%22%5B%5B%22%2Bdocument.title%2B%22%7C%22%2Blocation.href%2B%22%5D%5D%22))%7D)()
```

Converted to plain text using [URL Decode and Encode - Online](https://www.urldecoder.org) it looks like:

```javascript
javascript:(function(){javascript:void(prompt("Copy the text below and paste into your TiddlyWiki to create a link:", "[["+document.title+"|"+location.href+"]]"))})()
```

so I can now tweak this to:

```javascript
javascript:(function(){javascript:void(prompt("Copy the Markdown below and paste into your TiddlyWiki to create a link:", "["+document.title+"]("+location.href+")"))})();
```

Put that in a Firefox bookmark and you have a button to click to get a Markdown-formatted link, like:
```
[Wikipaulia — An epidemiologist dabbles in statistics, coding, open source software and the cloud.](https://prcleary.github.io)
```

