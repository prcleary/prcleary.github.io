---
title: "Xerte Online Toolkits: making a quiz pass rate mandatory"
date: 2023-03-12
tags:
  - Xerte Online Toolkits
  - e-learning
---

You can enforce a pass mark in an [XOT](https://xerte.org.uk/index.php/en/home) quiz - add the long snippet below to the source code of the "Feedback" section of the quiz.

The paragraph tags at the top are just a clumsy way of getting the spacing I want.

You set the pass mark (as a decimal; 1 means 100%) in this bit:

```javascript
myScore/quiz.questions.length == 1
```

The next arrow is disabled until the pass mark is reached - you can also customise the feedback according to whether the pass mark was reached.

```html
<p>
</p>
<p>
</p>
<p>
</p>
<p>
</p>
<p>
</p>
<p>
</p>
<p>
</p>
<p id="feedback1">
</p>
<script>
  var myScore = 0;
  for (var i=0; i<quiz.myProgress.length; i++) {
    if (quiz.myProgress[i] == true) {
      myScore++;
    }
  }
  if (myScore/quiz.questions.length == 1) {
    $("#x_nextBtn").button("enable");
    $("#feedback1").text('You passed - well done! Click the Next arrow below.');
  } else {
    $("#x_nextBtn").button("disable");
    $('#feedback1').text('You did not get all the questions right - click Restart to try again.')
  }
</script>
```

