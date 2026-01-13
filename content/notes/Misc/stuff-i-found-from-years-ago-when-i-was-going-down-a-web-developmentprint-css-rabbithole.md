+++
title = "Stuff I found from years ago when I was going down a Web development/Print CSS rabbithole"
+++

Just found these notes while clearing out old files, from an abortive Quarto blog years ago. I ended up going down a Web development rabbithole and got fed up with both Web development and Quarto.

---

## New blog 

I have never tried blogging before, though I have often considered it. I showed a few interesting things to a colleague recently, who asked me if I had a blog. So I have just spent half a day (of annual leave) setting up a blog with the R package `blogdown` (which uses Hugo), GitHub and Netlify. Kudos to <https://github.com/ojroques> who created and shared the theme I am using. I am using [ForwardEmail](https://forwardemail.net/) to forward email from the email address below to my own personal email. So it has all cost me nothing except time (OK I have to pay for the domain name), which was part of the challenge.  

This occasional blog is just for me to share things that might be useful to others, like training materials in draft, or where I have managed to help someone with a problem and learnt something in the process, or how to do things, or useful collated resources, and also for me to clarify my thinking in some areas by writing it down. It is not for self-promotion and I am not looking for another job, so I won't be tweeting about it or otherwise advertising it - if you are reading this, you are a member of a very select set that I have shared this with. Check out the RSS feed below if you are interested in following the blog. I probably won't post more than weekly. I follow a lot of blogs (too many) using a self-hosted instance of [Miniflux](https://miniflux.app) which I read on my phone with [FeedMe](https://play.google.com/store/apps/details?id=com.seazon.feedme).

I am a well-rounded geek with a lot of interests, but I intend to restrict this blog to technical matters of possible interest to epidemiologists, analysts of infectious disease surveillance data, R users, Python users, data scientists, and anyone else whose primary job relates to data and analysis, perhaps particularly health data, but who is also interested in other related technologies, in particular open source software. Let's see how it goes.

--- 

## First define your terms

Why have I called this blog epidemiologydatascience.net? Data science wasn't a term I used much prior to the COVID-19 pandemic. I had a vague idea that data scientists were just people who used both R and Python, and probably worked for Google or Facebook.

During the pandemic, those self-identifying as epidemiologists were often thrown together with those self-identifying as data scientists. I realised that some epidemiologists do data science of a sort, and that data scientists can do epidemiology.  Some mathematical modellers or statisticians realised that they could call themselves epidemiologists (it was probably not entirely coincidental that this was a term that the general public had become increasingly familiar with) but some could have called themselves data scientists instead. And many noticed how their roles were overlapping with those of their IT and informatics colleagues.  

So I think there is a rich multi/interdisciplinary area which could be called epidemiology data science (or epidemiological data science). [I am certainly not the first to think this](https://hdsr.mitpress.mit.edu/pub/twqhhlhr/release/2) or to consider the implications for traditional skill sets and career pathways. How do we define epidemiology data science (at least for the purposes of this blog)?

Epidemiology is [variously defined](https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0208442&type=printable#:~:text=Epidemiology%20is%20defined%20as%20the,the%20control%20of%20health%20problems), e.g. as the (soft) basic science of public health practice, or the discipline of asking what/how many/where/when/who/why questions about the health of populations. Data science is similarly tricky to pin down, as the data science skill set varies according to the domain of application, but at its broadest it could be defined as a discipline that learns from data using any of a wide range of (typically quantitative) analytical methods, sometimes in combination with elements of informatics/data engineering, software development and/or use of information and communication technologies (i.e. computers and networks). 

So epidemiology data science could be briefly defined as *the interdisciplinary study of population health data using quantitative analytical methods and computing technologies*. I could add e.g. "... to protect public health" but I don't want to exclude those working in academia (for whom knowledge creation could be an end in itself), or in industry (for whom the company bottom line could be the motivator), or any evil epidemiology data scientists who actually want to harm public health.

So what does this mean for someone like me, who came to epidemiology from a health or health science background and could conceivably have learned very little about analytical methods or computing technologies during my career? 

When I came into public health, a typical public health professional would be forced to learn some epidemiology and statistics at a couple of points in their early career. Afterwards they would usually forget any theory, which had only been hazily appreciated anyway, but retain enough useful rules of thumb such as "chi-squared test compares proportions" or "t test compares means" to be able to supervise junior staff doing basic analysis; more complicated stuff would definitely require a statistician. My typical public health professional might find learning more advanced methods painful. As a practically-focussed adult learner they might object to learning theory, however simplified, and might expect to be taught a practical and unequivocal rule-based approach similar to what they had retained for chi-squared tests etc (and ideally done by clicking a button), which would only be possible to a degree. 

Fortunately, I think this caricature is increasingly untrue. Almost everyone seems to want to "learn R" these days (OK maybe not the Stata and Python users) - that's an excellent way into epidemiology data science. The diversity of skills has grown in public health teams as a result of the pandemic. We have novel health data sources and more accessible analytical methods and computing technologies than you can shake a stick at, largely thanks to the open source philosophy. Whether we call it that or not, I think the future is bright for epidemiology data science.

---

## In which I start to do something practical

I was going to speak my mind about the kind of skills that I think epidemiology data scientists should acquire, but I have been distracted by something more interesting and practical. It's actually something related to something that I have been working on previously and now need to make some serious progress with. 

The task in hand is: reproduce a surveillance report that is currently produced manually and formatted laboriously in Word. I have done a version in RMarkdown, with a Word template, but I haven't been able to reproduce a few things like mixing text boxes with a multicolumn format. My version probably looks fine as it is, but I still think I can do better (meaning closer to the original). 

There is only so much you can do with basic RMarkdown. But [HTML](https://www.w3schools.com/html/)^[HyperText Markup Language] (the markup language behind Web pages) is much more flexible. Markdown was originally conceived as a simplified way of writing Web pages, so if you understand some Markdown you can easily understand basic HTML. I would recommend all epidemiology data scientists to at least do the basic W3Schools HTML course. 

HTML is even more flexible when combined with [CSS](https://www.w3schools.com/Css/)^[Cascading Style Sheets] (which is a way of defining the styles, such as size, colour, font, etc, for each part of a Web page and/or for the page overall). You can do a lot with some understanding of CSS, so doing enough of the W3Schools course to get the general idea should be enough for most epidemiology data scientists. CSS does get very complex beyond a certain level. 

The problem with creating a report as a Web page is that it may not look very good once printed, either to paper or PDF. You have little control on where pages begin and end. A few years ago I came across a solution to this called [paged.js](https://pagedjs.org), a JavaScript library "... that paginates any HTML content to produce beautiful print-ready PDF". JavaScript is the programming language of the Web, which runs in your browser to give your Web pages interactivity and other functionality. A library is a collection of code which allows a Web page to do something, and it is most often downloaded from the Web at the same time as the Web page using it. Pagination simply means breaking into pages (in a way that is under your control). At the time I didn't know enough about JavaScript to know where to start with paged.js, though you could clearly do [beautiful things](https://pagedjs.org/made-with-paged.js.html) with it. 

I did play with a self-hosted instance of [jsreport](https://jsreport.net) for a while, which is a very nice platform allowing you to create Web pages which are already paginated nicely for printing. It did allow me to create the more complex format that I was looking for. But in the end I realised it would not be easily integrated with my RMarkdown workflow.

Fortunately in recent years someone produced an R package which allows you to use paged.js: the [pagedown](https://pagedown.rbind.io) package. This (and related packages) provide templates for various documents such as reports and business cards. So if I can create my own custom pagedown template (using HTML and CSS) I can integrate this nicely into my workflow. If I can make the template generic enough and build it into an R package, it can be used for other similar reports by colleagues. 

In my next post I will get the basics working: setting up a new R package, creating a very basic pagedown template in it and putting everything on GitHub. After that I can develop it further and demonstrate something about HTML, CSS, fonts, SVG and perhaps even JavaScript.

---

## In which I become a Web developer

In my quest to develop a pagedown template,  I have realised why authors of other pagedown templates tend to provide one or more templates as is, with limited flexibility on overall format. It is because R users (including myself) tend not to be Web developers, and developing a pagedown template (though not using the pagedown package *per se*) really tests your basic understanding of HTML and CSS. Some examples of this approach are:

- [pagedown](https://pagedown.rbind.io): the main package
- [pagedreport](https://pagedreport.rfortherestofus.com): a few more additional templates
- [sgdf_pagedown](https://github.com/tvroylandt/sgdf_pagedown): a template for youth paramilitary organisations
  - another template derived from sgdf_pagedown: [INRAE_pagedown_template](https://github.com/SebastienBoutry/INRAE_pagedown_template)
- [another poster style](https://github.com/kbodwin/templates)
- [another CV/résumé style](https://github.com/nstrayer/cv)
- [another derivative one here](https://github.com/openvolley/ovpaged)

If I don't surpass this with my own template, I hope to expose the internals enough to make it modifiable without being an expert in HTML/CSS. 

The next thing I realised is that you don't need the pagedown package to use paged.js. It provides some convenience functions but you can manage just fine without it. I started off with an existing pagedown template, aiming to modify it for my own needs, [as others have done](https://github.com/rstudio/pagedown/pull/81/files), and ended up with something that worked but which I didn't fully understand. So I became interested to see if I could start with nothing and create my own template from scratch, without using the pagedown package. 

I've also realised that to explain what I am doing properly would take several blog posts. So in this post I will focus on how you can use HTML and CSS (with paged.js) to set up a basic Web page that can be printed to paginated PDF. Then I will develop it further with CSS to look like a report. Then I will show how to turn it into a template for RMarkdown. And finally I will make it into a package.

A minimal starting point for an HTML Web page is shown below. You can copy this code into a blank text file, call it something like `simple_html_template.html` and save it to a new folder on your Desktop. I explain what each part of the HTML means below.

Apart from the first line, which tells your browser that the text file it has just opened is a Web page, HTML is basically text and tags. 

- The text is usually what appears on the Web page. We haven't added any text to our example yet so it would just be a blank page if you opened the file in your browser.
- The tags (the bits surrounded by angle brackets, e.g. `<body>`) indicate the structure of the page: what is a heading, what is a paragraph, etc.
- Where tags need to surround something, they come in pairs, with an opening tag looking like `<tag>` and a closing tag looking like `</tag>`. It doesn't matter if paired tags are on the same line as what they are enclosing.
- It is common practice to indent things between tags for readability, but that is optional.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
    
</body>
</html>
```

Note that everything after the first line is "nested" within a pair of `<html>` tags. Within that there are two parts, called the head and the body, which are each demarcated by their own tags. Other things are nested within the head and body tags.

The head is where you put the *metadata* for the Web page. Metadata (basically meaning "information about information") is information about the Web page, such as information that the browser needs to show the page correctly. Metadata is usually not of interest to the user and so is not shown in the browser.

One important piece of metadata for the Web page is what character encoding system is in use. Computers use numbers to represent (or, to put it more technically, encode) characters (such as letters, numbers or punctuation) and there are different ways of doing that. When the computer sees a number, if you haven't told it which system to use, it might show the wrong character. The [UTF-8 system](https://www.smashingmagazine.com/2012/06/all-about-unicode-utf8-character-sets/#utf-8-to-the-rescue) is widely used because it compactly represents over 100,000 characters, including those from foreign languages, mathematical symbols etc etc. `<meta charset="UTF-8">` is telling the browser to use the UTF-8 system. 

The other piece of metadata that is shown here is the page title. The page title is important: it defines what is shown in the browser tab at the top of your page, but it is also what is shown if someone finds your page via a search engine or bookmarks your site. We can make the page title "Report" if we amend the code to show:

```html
<title> Report </title>
```

You may have noticed that the opening `<html>` tag contained `lang="en"`. This is also metadata, telling your browser that your page contains English text. 

The head section is also where you link your page to other resources such as files containing CSS formatting rules or JavaScript code. We will do this in a minute.

The body section is in general where we put the content that the user will see. To add one simple line of text to the page, we can use paragraph tags (`<p>`). Our HTML file now looks something like this:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title> Report </title>
    </head>
    <body>
        <p> Hello World!</p>
    </body>
</html>
```

Note that you can miss out certain tags (and let your browser guess which bits of your page are which) but it will cause you problems when you get to the CSS part. 

So now we have a valid HTML page. We can open it in our browser and admire our handiwork. The next step is to add pagination. At the moment we need JavaScript to do this, though one day it should be possible to do this using only CSS. 

We use `<script>` tags to include JavaScript in a Web page. You can include actual JavaScript code between these tags, or just point to an external file containing JavaScript code. The external file can be on your own computer or somewhere else on the Internet. paged.js is a JavaScript "library" (collection of code) which adds pagination to your page. It is an example of a "polyfill": a JavaScript library that enables browsers to do things that they can't do with existing standard HTML etc. Many such JavaScript libraries are made available for use by "content delivery networks", or CDNs. CDNs are basically Web services which rapidly provide commonly used resources to Web pages, which basically makes the Internet faster. To add paged.js to our Web page requires only one line of code:

```html
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
```

You can put this anywhere between the `<html>` tags, but it is common to put it at the end of the `<body>` section (i.e. on the line just before `</body>`), because sometimes this makes your page appear more quickly to the user.

paged.js allows us to use CSS to paginate a Web page. So let's add some CSS code. We can add CSS code directly into our Web page using `<style>` tags, or link our Web page to a file containing CSS code using a `<link>` tag. The CSS code could again be on our own computer or somewhere else on the Internet, such as on a CDN. Here we will use `<style` tags to include some CSS directly into our HTML file. 

Now our page looks something like this:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title> Report </title>
        <style>
@page {
    size: A4 portrait;
    margin: 50mm;
    @bottom-center {
        content: counter(page);
    }
}
        </style>
    </head>
    <body>
        <p> Hello World!</p>
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
    </body>
</html>
```

Note the part between `<style>` tags. In CSS code, anything that starts with a `@` is a special instruction to the browser. Here we are giving some special instructions to our browser that we want certain things to happen when we print the Web page to PDF. We want the page size to be A4 and in portrait orientation. We want 5cm margins for the page. We also want the bottom centre part of the margin to contain a page counter (i.e. a page number). 

If we save our HTML file, open it in our browser and print it to PDF, it should look like this:

<embed src="Report.pdf" type="application/pdf" width="100%" height="600px">

You now have a simple PDF from paginated HTML (note the page number). In the next post I will develop a somewhat more sophisticated version of this. 

---

## Cascading Style Sheets for Epidemiology Data Scientists

### CSS is easy

I have spent some weeks now delving into the complexities of CSS, the formatting language of the Web. CSS is easy at a basic level. If you want your paragraph text to be red, then all you need is:

```
p {
    color: red;
}
```

The `p` refers to the `<p>` element or elements in your web page. 

There are many such simple properties that you can set for your Web page, and tons of reference material where you can look them up, such as [this](https://htmlcheatsheet.com/css/). 

### CSS is difficult

CSS gets complicated beyond a certain level (OK so probably everything does :grinning:). What makes CSS hard in my limited exposure is:

1. **Browsers**. Users will view your web page using Chrome, or Safari, or Firefox, or Edge, or an old version of Internet Explorer, or on a mobile device, or on something else. These can all "render" (i.e. show) your web page in different ways. They also support the latest features of HTML and CSS in varying ways (or not at all) and this can change over time. So something which looks good to you can look a bit rubbish when viewed by others. 

    So what can you do? 
    
    You can write CSS which caters to different browsers by having different rules for each type of browser (using something called [*browser prefixes*](https://divi.space/divi-tutorials/browser-prefixes-explained/)), which is a faff. 
    
    You can try to stick to CSS which is supported by "modern browsers" ([which usually means not old versions of anything and in particular not old versions of Internet Explorer](https://caniuse.com/)) and tell users which browsers to use, which may only work if you have a captive audience. 
    
    You can use a *CSS reset* (a ready-made set of rules which removes browser inconsistencies) or a *CSS framework* (ready-made sets of rules allowing you to build web sites more quickly), which can mean learning a new syntax as well as learning CSS. 
    
    In my template I have used a CSS reset called [Normalize.css](https://necolas.github.io/normalize.css/). I have managed not to use a CSS framework, though I was sorely tempted. 
2. **Layout and flow**. Layout in CSS is tricky, and particularly tricky if you are trying to design a document that fits neatly onto A4 pages. Normal web pages can scroll infinitely (down or sideways) and don't need to break at the margins of pages. 

    You have to grasp a number of concepts and models to understand how to lay out a web page with CSS, including the [box model](https://www.w3schools.com/Css/css_boxmodel.asp), the [display](https://www.w3schools.com/CSSref/pr_class_display.asp) property, [absolute and relative positioning](https://www.w3schools.com/Css/css_positioning.asp), [floats](https://www.w3schools.com/csS/css_float.asp) and the various [units](https://www.w3schools.com/Css/css_units.asp) used for sizing things, which are all beyond the scope of this blog post. In addition there are newer layout models called [Flexbox](https://www.w3schools.com/csS/css3_flexbox.asp) and [Grid](https://www.w3schools.com/css/css_grid.asp), which (though powerful) I tried to avoid using/learning as they didn't seem to help much with print layout and [may actually break it](https://thinkdrastic.net/journal/2022/02/07/paged-js-and-css-flex-grid/). I recommend the [Interneting is Hard](https://www.internetingishard.com/html-and-css/) site if you want to learn more about CSS layout.
    
    I wanted a header section showing the title, institution and a couple of logos. I wanted the main body of the document to be a mixture of one or two columns, with some images fitting within a column and some taking the whole width of the document. I wanted the possibility of text boxes at various locations. This was all tricky; for example, it was easy to create a two-column section, but how do I stop the contents of a column flowing into the next page rather than into the second column on the same page? This was probably the most difficult part of all of it. There are developing areas of CSS such as [CSS Regions](https://www.hongkiat.com/blog/css3-regions/) which may make similar print layout/flow tasks easier in future.
3. **Specificity**. *Help! I have added a CSS rule and my browser has ignored it! My paragraph text is not red!* A CSS rule is actually more of a suggestion to your browser about how something should be formatted. Your browser has to reconcile formatting suggestions from a number of sources. There are the rules you added, many more rules already included in the web page and any CSS frameworks it uses, and the last-resort rules that the browser itself applies. It is inevitable that the same component of a web page (e.g. the paragraph text that you want to be red) ends up being targeted by multiple rules. 

    The browser decides which rule to apply based on a number of criteria such as where the rule comes from and how *specific* it is. A rule is more likely to be applied if it is in the web page code (rather than in a separate file) and if it targets something very specific, like paragraph text in a particular section of the web page rather than targetting all paragraph text elements. 
    
    This didn't turn out to be a big issue for me. You just have to remember that when you specify a CSS rule you may be *overriding* an existing rule, and so the more specific you make it the better. There is a sort of CSS trump card that you can pull out in desperation (adding `!important` to your rule) but it seems to be regarded as poor style and an admission of ignorance and defeat. It isn't even guaranteed to work (the rule you are trying to override may also have `!important`)!
4. **Print CSS learning resources**. Most CSS out there is aimed at developers who want to create web pages that look good both on big desktop screens and small mobile devices - known as *responsive design*. There is much less prior art out there for print CSS. Much of that is aimed at developers who want to develop an alternate printable version of their website, rather than those primarily targeting print/PDF. Much of the relevant CSS resources that I did find assumed I wanted to create a whole book rather than just a report.

I will spend the rest of this blog post summarising a few of the more useful things I found to help me design my report with CSS.

### Resources for print CSS 

Of course I started out looking for someone who had done something similar so that I could take it apart to understand it. 

The closest I could find was was [PubCSS](https://thomaspark.co/2015/01/pubcss-formatting-academic-publications-in-html-css/), which are HTML/CSS templates providing standard academic conference proceedings as printable HTML (there is something similar [here](https://css4.pub/)). It was quite useful for the example code (though I wanted something less academic), but it relies on using some non-open source software called [Prince](https://www.princexml.com/samples/) for printing, which wouldn't have fitted into the workflow I was imagining. There is an open source tool called [Vivliostyle](https://vivliostyle.org/) for creating PDF using HTML and CSS, which looks promising and which I will come back to at some point. I have some previous experience of using another tool called [Weasyprint](https://weasyprint.org/) and another tool called [wkhtmltopdf](https://wkhtmltopdf.org/). But I wanted something that could be printed from any modern browser without external tools. 

Code examples from the Prince and Vivliostyle documentation were useful. The old [Paged Media](https://www.pagedmedia.org/paged-js/) site is still useful, though the documentation at [pagedjs.org](https://pagedjs.org/) now probably covers all or most of that. I found a couple of free books such as [this one from a company called Antenna House](https://www.antennahouse.com/hubfs/PDFS/CSS%20for%20Paged%20Media/CSS-Print-en-2019-02-15.pdf). There are a [few](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/) [good](http://alistapart.com/article/building-books-with-css3/) [articles](https://suntoucher.de/typesetting-a-novel-for-print-with-html-css-paged-media/) but usually focussing on book creation without going into more complex layouts. 

Next post I will definitely share the template and explain the CSS that I used.

---

## The perils of perfectionism
> I am still not happy with this

Since my last post I have learned a vast amount about CSS and other things - too much to include in one blog post. I must set myself more realistic and discrete goals. 

Here is the latest version *[NB: not shown - it wasn't that good]*. 

<embed src="The Plague of London.pdf" type="application/pdf" width="100%" height="600px">

It isn't what I intended, but it looks OK for a first try. I was aiming for something like a parish newsletter, with minimal white space, but after playing with CSS and Google Fonts a lot ended up with this. You may recognise the content - if you don't, check [this](https://www.gutenberg.org/ebooks/376) out. 

The RMarkdown is below. The first thing to note is the YAML at the top, delimited by `---`. Any values you supply here will be slotted into the template that Pandoc uses when your final document is created. In the Pandoc template, the placeholders for these values are indicated by dollar signs. For example, the value for `author` in the YAML will replace the placeholder `$author$` in the template. This is all documented [here](https://pandoc.org/MANUAL.html#templates). By including the CSS in my template (when it could have been a separate file) I could allow users to specify formatting options, such as fonts, in the YAML.

The next thing to notice is that I am using Pandoc [fenced divs](https://pandoc.org/MANUAL.html#extension-fenced_divs) to apply CSS classes (i.e. specific formatting) to sections of text. This allows you to do things like create fancy boxes, or change between single and double column formatting. 

Note also how the template to use is defined in the YAML. 

The template is also below. I have tried to document each part of it, but as I worked on it for quite some time, I don't remember why I did every thing. Notable features include:

- It makes some attempt to cater for older browsers (though that is increasingly unnecessary) and also uses a CSS reset to minimise differences in browser rendering. 
- It uses [Google Fonts](https://fonts.google.com/). I played with different combinations for too long. You can change these in the YAML, though not all seemed to work for me.
- The CSS is embedded in the HTML. It makes some limited use of [CSS variables](https://www.w3schools.com/css/css3_variables.asp) to avoid retyping things. A lot of the CSS is only relevant to `paged.js`. I don't entirely understand the use of `string-set` for setting values that appear in the running footer.

Next step is to create an R package for deployment and put it all on GitHub, which will be among my next posts. I will try to post some more fun stuff, that doesn't require quite so much effort on my part. 

### The RMarkdown

    ---
    author: "Daniel Defoe"
    date: "`r format(Sys.Date(), '%d %b %Y')`"
    email: daniel.defoe@crusoe.com
    font-h1: "Cardo"
    font-h2-h3: "Quintessential"
    font-p: "Georgia"
    banner-logo-left: logo1.jpg
    banner-logo-right: logo2.jpg
    output: 
      html_document:
        self_contained: true
        template: surveillance-report-template.html
    subtitle: "Weekly Update"
    telephone: 999-999-999
    theme-colour: "#11414A"
    title: "The Plague of London"
    ---
    
    ```{r setup, include=FALSE}
    knitr::opts_chunk$set(echo = TRUE)
    ```
    
    > "I recommend it to the Charity of all good People to look back, and reflect duly upon the Terrors of the Time; and whoever does so will see, that it is not an ordinary Strength that cou'd support it; it was not like appearing in the Head of an Army, or charging a Body of Horse in the Field; but it was charging Death itself on his pale Horse; to stay indeed was to die, and it could be esteemed nothing less."
    
    ## 1. Epidemiology 
    
    ::: floatbox-half-left
    
    ![Figure 1: Epidemic curve](epicurve.jpg)
    
    :::
    
    And here I cannot but take notice that the strange temper of the people of London at that time contributed extremely to their own destruction. The plague began, as I have observed, at the other end of the town, namely, in Long Acre, Drury Lane, &c., and came on towards the city very gradually and slowly. 
    
    It was felt at first in December, then again in February, then again in April, and always but a very little at a time; then it stopped till May, and even the last week in May there was but seventeen, and all at that end of the town; and all this while, even so long as till there died above 3000 a week, yet had the people in Redriff, and in Wapping and Ratcliff, on both sides of the river, and almost all Southwark side, a mighty fancy that they should not be visited, or at least that it would not be so violent among them. 
    
    ::: floatbox-half-right 
    
    ![Figure 2: Plague map](plague_map.jpg)
    
    :::
    
    Some people fancied the smell of the pitch and tar, and such other things as oil and rosin and brimstone, which is so much used by all trades relating to shipping, would preserve them. Others argued it, because it was in its extreamest violence in Westminster and the parish of St Giles and St Andrew, &c., and began to abate again before it came among them—which was true indeed, in part. 
    
    That it was observed the numbers mentioned in Stepney parish at that time were generally all on that side where Stepney parish joined to Shoreditch, which we now call Spittlefields, where the parish of Stepney comes up to the very wall of Shoreditch Churchyard, and the plague at this time was abated at St Giles-in-the-Fields, and raged most violently in Cripplegate, Bishopsgate, and Shoreditch parishes; but there was not ten people a week that died of it in all that part of Stepney parish which takes in Limehouse, Ratcliff Highway, and which are now the parishes of Shadwell and Wapping, even to St Katherine’s by the Tower, till after the whole month of August was expired. But they paid for it afterwards, as I shall observe by-and-by.
    
    ::: floatbox-half-right
    
    ### From the 8th to the 15th August 
    
    |                                 |       |
    |---------------------------------|------:|
    | St Giles-in-the-Fields          |   242 |
    | Cripplegate                     |   886 |
    | Stepney                         |   197 |
    | St Margaret, Bermondsey         |    24 |
    | Rotherhithe                     |     3 |
    | Total this week                 |  4030 |
    
    ### From the 15th to the 22nd August 
    
    |                                 |        |
    |---------------------------------|-------:|
    | St Giles-in-the-Fields          |    175 |
    | Cripplegate                     |    847 |
    | Stepney                         |    273 |
    | St Margaret, Bermondsey         |     36 |
    | Rotherhithe                     |      2 |
    | Total this week                 |   5319 |
    
    :::
    
    ## 2. Public knowledge, attitude and behaviours
    
    This, I say, made the people of Redriff and Wapping, Ratcliff and Limehouse, so secure, and flatter themselves so much with the plague’s going off without reaching them, that they took no care either to fly into the country or shut themselves up. Nay, so far were they from stirring that they rather received their friends and relations from the city into their houses, and several from other places really took sanctuary in that part of the town as a Place of safety, and as a place which they thought God would pass over, and not visit as the rest was visited.
    
    And this was the reason that when it came upon them they were more surprised, more unprovided, and more at a loss what to do than they were in other places; for when it came among them really and with violence, as it did indeed in September and October, there was then no stirring out into the country, nobody would suffer a stranger to come near them, no, nor near the towns where they dwelt; and, as I have been told, several that wandered into the country on Surrey side were found starved to death in the woods and commons, that country being more open and more woody than any other part so near London, especially about Norwood and the parishes of Camberwell, Dullege, and Lusum, where, it seems, nobody durst relieve the poor distressed people for fear of the infection.
    
    
    This notion having, as I said, prevailed with the people in that part of the town, was in part the occasion, as I said before, that they had recourse to ships for their retreat; and where they did this early and with prudence, furnishing themselves so with provisions that they had no need to go on shore for supplies or suffer boats to come on board to bring them,—I say, where they did so they had certainly the safest retreat of any people whatsoever; but the distress was such that people ran on board, in their fright, without bread to eat, and some into ships that had no men on board to remove them farther off, or to take the boat and go down the river to buy provisions where it might be done safely, and these often suffered and were infected on board as much as on shore.
    
    ::: page-break
    
    :::
    
    ::: twocolumn
    
    As the richer sort got into ships, so the lower rank got into hoys, smacks, lighters, and fishing-boats; and many, especially watermen, lay in their boats; but those made sad work of it, especially the latter, for, going about for provision, and perhaps to get their subsistence, the infection got in among them and made a fearful havoc; many of the watermen died alone in their wherries as they rid at their roads, as well as above bridge as below, and were not found sometimes till they were not in condition for anybody to touch or come near them.
    
    Indeed, the distress of the people at this seafaring end of the town was very deplorable, and deserved the greatest commiseration. But, alas! this was a time when every one’s private safety lay so near them that they had no room to pity the distresses of others; for every one had death, as it were, at his door, and many even in their families, and knew not what to do or whither to fly.
    
    This, I say, took away all compassion; self-preservation, indeed, appeared here to be the first law. For the children ran away from their parents as they languished in the utmost distress. And in some places, though not so frequent as the other, parents did the like to their children; nay, some dreadful examples there were, and particularly two in one week, of distressed mothers, raving and distracted, killing their own children; one whereof was not far off from where I dwelt, the poor lunatic creature not living herself long enough to be sensible of the sin of what she had done, much less to be punished for it.
    
    It is not, indeed, to be wondered at: for the danger of immediate death to ourselves took away all bowels of love, all concern for one another. I speak in general, for there were many instances of immovable affection, pity, and duty in many, and some that came to my knowledge, that is to say, by hearsay; for I shall not take upon me to vouch the truth of the particulars.
    
    
    To introduce one, let me first mention that one of the most deplorable cases in all the present calamity was that of women with child, who, when they came to the hour of their sorrows, and their pains come upon them, could neither have help of one kind or another; neither midwife or neighbouring women to come near them. Most of the midwives were dead, especially of such as served the poor; and many, if not all the midwives of note, were fled into the country; so that it was next to impossible for a poor woman that could not pay an immoderate price to get any midwife to come to her—and if they did, those they could get were generally unskilful and ignorant creatures; and the consequence of this was that a most unusual and incredible number of women were reduced to the utmost distress. Some were delivered and spoiled by the rashness and ignorance of those who pretended to lay them. Children without number were, I might say, murdered by the same but a more justifiable ignorance: pretending they would save the mother, whatever became of the child; and many times both mother and child were lost in the same manner; and especially where the mother had the distemper, there nobody would come near them and both sometimes perished. Sometimes the mother has died of the plague, and the infant, it may be, half born, or born but not parted from the mother. Some died in the very pains of their travail, and not delivered at all; and so many were the cases of this kind that it is hard to judge of them.
    
    :::
    
    ::: page-break
    
    :::
    
    ## 3. Child Mortality
    
    Something of it will appear in the unusual numbers which are put into the weekly bills (though I am far from allowing them to be able to give anything of a full account) under the articles of -
    
    ### Child-bed. Abortive and Still-born. Chrisoms and Infants.
    
    Take the weeks in which the plague was most violent, and compare them with the weeks before the distemper began, even in the same year. For example:
    
    |              |    |                |     | Child-bed.  | Abortive.   | Still-born.  |
    |:------------:|:--:|:--------------:|:---:|:----------:|:----------:|:--------------:|
    | From January |  3 | to January     | 10  |  7         |     1      |      13        |
    |     "        | 10 |      "         | 17  |  8         |     6      |      11        |
    |     "        | 17 |      "         | 24  |  9         |     5      |      15        |
    |     "        | 24 |      "         | 31  |  3         |     2      |       9        |
    |     "        | 31 | to February    |  7  |  3         |     3      |       8        |
    |   February   |  7 |      "         | 14  |  6         |     2      |      11        |
    |     "        | 14 |      "         | 21  |  5         |     2      |      13        |
    |     "        | 21 |      "         | 28  |  2         |     2      |      10        |
    |     "        | 28 | to March       |  7  |  5         |     1      |      10        |
    |     "        |    |      "         |     |            |            |                |
    |     "        |    |      "         |     | 48         |    24      |   100          | 
    |     "        |    |      "         |     |            |            |                |
    | From August  |  1 | to August      |  8  | 25         |     5      |      11        |
    |     "        |  8 |      "         | 15  | 23         |     6      |       8        |    
    |     "        | 15 |      "         | 22  | 28         |     4      |       4        |
    |     "        | 22 |      "         | 29  | 40         |     6      |      10        |    
    |     "        | 29 | to September   |  5  | 38         |     2      |      11        |
    | September    |  5 |      "         | 12  | 39         |    23      |     ...        |
    |     "        | 12 |      "         | 19  | 42         |     5      |      17        |
    |     "        | 19 |      "         | 26  | 42         |     6      |      10        |
    |     "        | 26 | to October     |  3  | 14         |     4      |       9        |
    |              |    |                |     |            |            |                |
    |              |    |                |     | 291        |    61      |      80        |
    
    To the disparity of these numbers it is to be considered and allowed for, that according to our usual opinion who were then upon the spot, there were not one-third of the people in the town during the months of August and September as were in the months of January and February. In a word, the usual number that used to die of these three articles, and, as I hear, did die of them the year before, was thus:—
    
    | 1664.                       |      |  1665.                   |       |
    |-----------------------------|:----:|--------------------------|:-----:|
    | Child-bed                   | 189  |  Child-bed               |   625 |
    | Abortive and still-born     | 458  |  Abortive and still-born |   617 |
    |                             |      |                          |       |
    |                             | 647  |                          |  1242 |
    
    This inequality, I say, is exceedingly augmented when the numbers of people are considered. I pretend not to make any exact calculation of the numbers of people which were at this time in the city, but I shall make a probable conjecture at that part by-and-by. What I have said now is to explain the misery of those poor creatures above; so that it might well be said, as in the Scripture, Woe be to those who are with child, and to those which give suck in that day. For, indeed, it was a woe to them in particular.
    
    ## 4. Impact on Newborn Children
    
    I was not conversant in many particular families where these things happened, but the outcries of the miserable were heard afar off. As to those who were with child, we have seen some calculation made; 291 women dead in child-bed in nine weeks, out of one-third part of the number of whom there usually died in that time but eighty-four of the same disaster. Let the reader calculate the proportion.
    
    There is no room to doubt but the misery of those that gave suck was in proportion as great. Our bills of mortality could give but little light in this, yet some it did. There were several more than usual starved at nurse, but this was nothing. The misery was where they were, first, starved for want of a nurse, the mother dying and all the family and the infants found dead by them, merely for want; and, if I may speak my opinion, I do believe that many hundreds of poor helpless infants perished in this manner. Secondly, not starved, but poisoned by the nurse. Nay, even where the mother has been nurse, and having received the infection, has poisoned, that is, infected the infant with her milk even before they knew they were infected themselves; nay, and the infant has died in such a case before the mother. I cannot but remember to leave this admonition upon record, if ever such another dreadful visitation should happen in this city, that all women that are with child or that give suck should be gone, if they have any possible means, out of the place, because their misery, if infected, will so much exceed all other people’s.
    
### The HTML template

    <!-- This is a comment in HTML! -->
    <!-- Tell the browser to expect an HTML 5 page -->
    <!DOCTYPE html>
    <!-- Start of Web page -->
    <!-- where all the text will be in English -->
    <html lang="en">
        <!-- Set metadata for the page in the "head" - stuff that won't be shown -->
        <head>
            <!-- Use a character set with all the symbols you could possible need -->
            <meta charset="UTF-8">
            <!-- Adapt page to size of whatever device it is viewed on -->
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <!-- Enable HTML5 tags for older IE -->
            <!--[if lt IE 9]>  
                <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
            <![endif]-->
            <!-- Google Fonts --> 
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=$font-h1$">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=$font-h2-h3$">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=$font-p$">
            <!-- Paged JS JavaScript-->
            <!-- Note the "defer" property,--> 
            <!-- meaning the JavaScript is downloaded in parallel and run after the page is ready -->
            <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js" defer></script>
            <!-- Normalize CSS reset to deal with browser differences -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <!-- CSS goes between style tags -->
            <style>
                /* This is a comment in CSS! */
                /* Set CSS variables to allow reuse of values */
                /* The ":root" element basically refers to the whole HTML document */
                :root {
                    /* Set a theme colour from the RMarkdown YAML */
                    /* Anything delimted by dollar signs needs to be defined in the RMarkdown YAML */
                    /* Note later on how CSS variables can then be used as "var(--variablename)" */
                    --theme-colour: $theme-colour$;
                }
                /* STYLING OF HTML ELEMENTS */
                /* An asterix means every element, ie any properties set here are set for all elements */
    * {
        /* Width and height of elements not affected by changes to padding or borders - makes things easier */
        box-sizing: border-box;
    }
                /* Add hyphenation to text and set margins and padding of body element to zero */
                body {
                    hyphens: auto;
                    margin: 0;
                    padding: 0;
                }
                /* There are lots of things where you don't want page breaks */
                button, caption, colgroup, embed, figure, form, h1, h2, h3, h4, h5, h6, label, legend, li, object, p, script, style, tbody, td, textarea, tfoot, th, tr, table, thead {
                    page-break-inside: avoid;
                }
                /* Add space between image and text; set maximum width of image */
                img {
                    padding: 3mm;
                    max-width: 80%;
                }
                /* Set fonts */
                h1 {
                    font-family: $font-h1$, sans-serif;
                    padding: 2mm;
                }
                h2, h3 {
                    font-family: $font-h2-h3$, sans-serif;
                }
                /* Format paragraph text */
                p {
                    border: 0;
                    font-family: $font-p$, serif;
                    line-height: 1.3;
                    margin: 0;
                    padding: 5px;
                    text-align: justify;
                }
                /* Format tables - could have done a lot more here */
                table {
                    margin-left: auto;
                    margin-right: auto;
                    page-break-inside: avoid;
                }
                table, th, td {
                    border: 1px solid;
                    border-collapse: collapse;
                }
                /* STYLING RELATED TO PAGED.JS */
                @page {
                    /* Styles what goes in the margins of the page */
                    /* Put report date in middle at bottom of page, with theme colour, some transparency and centring */ 
                    @bottom-center {
                        color: var(--theme-colour);
                        opacity: 0.75;
                        text-align: center;
                        /* The "string" part takes some text content defined elsewhere in the CSS by "string-set" */
                        content: string(date);
                    } 
                    /* Put report title on left at bottom of page */ 
                    @bottom-left {
                        color: var(--theme-colour);
                        content: string(title);
                        opacity: 0.75;
                        text-align: left;
                    }
                    /* Put page number on right at bottom of page */ 
                    @bottom-right {
                        color: var(--theme-colour);
                        content: "Page " counter(page);
                        opacity: 0.75;
                        text-align: right;
                    } 
                    /* The page and page margin sizes */
                    margin-bottom: 15mm;
                    margin-left: 10mm;
                    margin-right: 10mm;
                    margin-top: 5mm;
                    size: A4;
                }
                /* Some differences for the first page */ 
                @page:first {
                    /* On first page, put email in middle at bottom of page */ 
                    @bottom-center {
                        color: var(--theme-colour);
                        content: "Email: " string(email);
                        opacity: 0.75;
                        text-align: center;
                    } 
                    /* On first page, put report author on left at bottom of page */ 
                    @bottom-left {
                        color: var(--theme-colour);
                        content: string(author);
                        opacity: 0.75;
                        text-align: left;
                    }
                    /* On first page, put telephone number on right at bottom of page */ 
                    @bottom-right {
                        color: var(--theme-colour);
                        content: "Telephone: " string(telephone);
                        opacity: 0.75;
                        text-align: right;
                    } 
                }
                /* Format author; set author variable for running footer */
                .author {
                    string-set: author content(text);
                    font-style: italic;
                }
                /* Format banner */
                .banner {
                    background: var(--theme-colour);
                    padding: 2mm;
                }
                .banner .banner-logo-left {
                    float: left;
                    padding: 2mm;
                    width: 15%;
                }
                .banner .banner-logo-right {
                    float: right;
                    padding: 2mm;
                    width: 15%;
                }
                /* Some boilerplate CSS that fixes issues with floats */
                .clearfix::after {
                    content: "";
                    clear: both;
                    display: table;
                }
                /* Can't remember why this is here! */
                .column-break-after {
                    break-after: column; 
                }
                /* Set date variable for running footer */
                .date {
                    string-set: date content(text);
                }
                /* Set email variable for running footer */
                .email {
                    string-set: email content(text);
                }
                /* Create a class for putting a section of text in a box on the left with a shadow */
                .floatbox-half-left {
                    box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
                    float: left;
                    margin: 5mm;
                    padding: 3mm;
                    page-break-inside: avoid;
                    width: 50%;
                }
                .floatbox-half-left img {
                    width: 100%;
                }
                /* Create a class for putting a section of text in a box on the right with a shadow */
                .floatbox-half-right {
                    box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
                    float: right;
                    margin: 5mm;
                    padding: 3mm;
                    page-break-inside: avoid;
                    width: 50%;
                }
                .floatbox-half-right img {
                    width: 100%;
                }
                /* This allows for manual page breaks */
                .page-break {
                    break-after: page; 
                }
                /* Include a landscape page - not sure this works */
                div.sideways {
                    page: Landscape;
                }
                /* Format subtitle; set subtitle variable for banner header */
                .subtitle {
                    color: white;
                    font-family: $font-h2-h3$;
                    font-style: italic;
                    font-variant: small-caps;
                    string-set: subtitle content(text);
                    text-align: center;
                }
                /* Set telephone variable for running footer */
                .telephone {
                    string-set: telephone content(text);
                }
                /* Format title; set title variable for banner header */
                .title {
                    color: white;
                    font-style: bold;
                    string-set: title content(text);
                    text-align: center;
                    text-transform: uppercase;
                }
                /* Create a class for two column format */
                .twocolumn {
                    column-count: 2;
                    column-gap: 5mm;
                }
                .twocolumn p {
                    border: 0;
                    margin: 0;
                    padding: 5mm;
                    text-align: justify;
                }
            </style>
            <!-- Use title from YAML -->
            <title>$title$</title>
        </head>
        <body>
            <!-- Put variables for banner header and running footer in a hidden div - needed to make it work -->
            <div hidden>
                <p class = "title">$title$</p>
                <p class = "author">$author$</p>
                <p class = "date">$date$</p>
                <p class = "email">$email$</p>
                <p class = "telephone">$telephone$</p>
            </div>
            <!-- Create the banner -->
            <div class="banner">
                <img src="$banner-logo-right$" alt="" class="banner-logo-right">
                <img src="$banner-logo-left$" alt="" class="banner-logo-left">
                <div>
                    <h1 class="title">$title$</h1>
                    <p class="subtitle">$subtitle$</p>
                </div>
            </div>
            <!-- Then the rest of the document goes here -->
            $body$
            <script>
            </script>
        </body>
    </html>
    
---
