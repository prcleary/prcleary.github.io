+++
title = "How to follow blogs without RSS feeds"
+++

If like me you have given up on Twitter, Reddit, Mastodon and whatnot (I haven't deleted my Facebook and LinkedIn accounts just yet), and follow blogs exclusively using their RSS (or Atom or JSON) feeds, then you will occasionally find a really good geek blog which inexplicably does not have a web feed (expecting you to use Twitter or Mastodon instead). In vain you will add things like `/feed.xml` to the end of the URL or search the page source. 

The geekiest solution is to use something like [RSS-Bridge](https://rss-bridge.github.io/rss-bridge/), either using the official instance or hosting it yourself. I've set this up but never spent enough time trying to understand it, and therefore have never got it to work. It is not exactly automatic and requires some knowledge of CSS selectors and similar things (possibly more than I have) to create a feed.

There is an easier solution. You can use something like [RSS Anything](https://rss.diffbot.com/), a free service which provides an RSS or Atom feed for any public Web page with a list of links (not just blogs). If you find a blog with a feed, simply find the page that lists the blog entries and then give that URL to RSS Anything - it will generate a feed for you automatically, which you can then add to your feed reader. 

Today I realised I could automate that process a bit by creating a bookmarklet (a bookmark button in your browser toolbar which runs a bit of JavaScript). Now once I navigate to the blog page with the links of interest I just have to click the button and RSS Anything will open, giving me the feed links.

To create the bookmarklet (in Firefox)

- Right-click the browser toolbar and click "Add Bookmark".
- In the Name field, enter what you want to appear on the button, e.g. "RSS Anything".
- In the URL field, enter the following:
  ```javascript
  javascript:location.href='https://rss.diffbot.com/feeds?url='+encodeURIComponent(window.location.href)
  ```
- Save the bookmark.

Here's an example with this blog: [Blog | Adrian Göransson](https://adrg.se/blog) (note that this is the page listing the blog entries, not the home page)

Click the button and you will get two feeds:

- <https://rss.diffbot.com/rss?url=https://adrg.se/blog>
- <https://rss.diffbot.com/atom?url=https://adrg.se/blog>

Add one of these to your feed reader (I always add the RSS one in honour of [Aaron Swartz](https://www.rollingstone.com/culture/culture-news/the-brilliant-life-and-tragic-death-of-aaron-swartz-177191/)). 

If you like the idea of bookmarklets, then check out [Jesse's Bookmarklets Site](https://www.squarefree.com/bookmarklets/).

