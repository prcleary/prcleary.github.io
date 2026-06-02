---
title: "Xerte Online Toolkits: hiding the Next button for a specified time"
date: 2023-06-20
tags:
  - Xerte Online Toolkits
  - e-learning
---

You can hide the Next button for a specified time (say 15 seconds) to confound people like me who try to click through e-learning as fast as possible.

Add a Script element (from the right hand menu) and replace its content with this:

```javascript
// JavaScript / jQuery
$("#x_nextBtn").hide();
setTimeout(
  function()
  {
      $("#x_nextBtn").show()
  }, 15000);
```

Set Execute to "First time page is viewed".

If you want to hide both navigation buttons, and make the Next button flash when it reappears, you can use:

```javascript
// JavaScript / jQuery
$("#x_nextBtn,#x_prevBtn").hide();
setTimeout(
  function()
  {
      $("#x_nextBtn,#x_prevBtn").show()
      $("#x_nextBtn").effect("pulsate", {times: 5}, 3000)
  }, 10000);
```


