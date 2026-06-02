---
title: Teaching Bayesian statistics
date: 2022-11-08
tags:
  - statistics
  - Bayesian
---

My notes on a Bayesian statistics talk I gave

The idea was to take them through an outbreak analysis

- firstly through a "standard" single variable and multivariable analysis
- then highlight issues with p values, multiple testing, model selection
- then show how Bayesian methods are more or less drop-in replacements
- Bayes factors
- Bayesian logistic regression with different priors (elicitation)
- Bayesian model averaging


### Rigour

- there are problems with our current statistical practice
- we teach null hypothesis significance testing to our trainees
- but they often don't understand it or interpret it appropriately - nor do the people teaching it
- and in any case it is not asking the question we want to ask
- I won't ask the audience to correctly define a p value as they probably can't
- I won't ask the audience what they think the probability of being wrong is when rejecting a null hypothesis as they probably think it is 5%
- a little history
- Ronald Fisher (he of the exact test): statistical genius who laid the foundations of modern statistics
- tarnished reputation because of enthusiasm for eugenics (controversial even in his own day) and for supporting the tobacco industry in attempts to discredit studies linking smoking with lung cancer
- he didn't invent the p value but he was the first to apply it widely
- in his approach you formulated one hypothesis, the null hypothesis; shorthand is $H_0$
- the null hypothesis typically the opposite of your research hypothesis; e.g. if your research hypothesis is that smoking is associated with lung cancer, your null hypothesis is that smoking is not associated with lung cancer
- you then calculate a statistic from your data
- then relying on various assumptions you calculate the probability of that statistic (or one further from your null hypothesis) occurring **if the null hypothesis is true**
- in shorthand we can call this $P(D|H_0)$
- of course what we are really interested in the probability of the null hypothesis given the data
- in shorthand $P(H_0|D)$
- perhaps this is what you thought a p value was
- it is not
- $P(D|H_0)\neq P(H_0|D)$
- Does $P(catholic|pope)=P(pope|catholic)$?
- the "error of the transposed conditional" (Colquhoun)
- Fisher initially used p values as a kind of subjective rating scale
- he regarded p values as a measure of the strength of evidence against this null hypothesis
- at some point he was quoted as saying that he would not consider as evidence anything where the p value was not consistently less than 0.05 across studies
- which is where $p<0.05$ seems to have come from
- but later in his career he described $p<0.05$ as "quite a low standard of evidence"
- Fisher ultimately rejected the very idea of a conventional level of significance
- So why would the Sunday Telegraph say recently: "the plain fact is that 70 years ago Ronald Fisher gave scientists a mathematical machine for turning boloney into breakthroughs and flukes into funding".
- perhaps Fisher is not entirely to blame
- the story continues
- leading statisticians Jerzy Neymann and Egon Pearson identified issues with Fisher's approach
- with which Fisher bitterly disagreed
- they argued that we also need to consider the actual research hypothesis that we are interested in somehow
- they called this "the alternative hypothesis"
- a statistically significant result can still be of no importance in clinical or public health terms
- having an alternative hypothesis allows us to specify the minimum difference that is likely to be important
- for example, we could specify an alternative hypothesis that the odds ratio of association is > 2 or 3 (as anything less could be unimportant)
- as a digression: ORs of 2-3 can easily be caused by residual confounding (look into "e values" if you are interested in learning more)
- Neymann and Pearson also introduced the concepts of type I and type II errors
- the type II error is easiest to understand
- it is wrongly not rejecting the null hypothesis when it is in fact false
- in other words a false negative study
- conventionally we accept a 10-20% probability of a type II error
- we often call this probability "beta" or $\beta$
- in other words having *power* of 80-90% to reject the null hypothesis when true (or "detect a difference" etc)
- the type I error is often misunderstood
- it is wrongly rejecting the null hypothesis when it is in fact true
- in other words a false positive study
- conventionally we are less accepting of false positives than false negatives
- will only accept a probability of 5% for a type I error
- we often call this probability "alpha" or $\alpha$
- this is sometimes misunderstood as "the probability you are wrong" when your study is positive (significant p value)
- but actually the probability that you are wrong is usually much higher than this - why is this?
- note the definition of alpha
- like the p value, it only has meaning based on an assumption that the null hypothesis is true
- but you don't know whether the null hypothesis is true
- if you already knew that you wouldn't be doing the study
- so the probability that you are wrong also depends on the probability that the null hypothesis is true
- in practice most null hypotheses are true and we often expect this to be the case, based on other studies or previous experience
- we tend to ignore this kind of "prior" information









---

- multiple comparisons, data dredging, alpha inflation

- Neymann and Pearson (alternative hypothesis needed e.g. OR > 2, otherwise what are you comparing? how do you know the difference is clinically meaningful? how can you look at Type II error? makes more sense with Colquhoun's diagram; $P(D|H_1)/P(D|H_0)$; two types of error, type I and II; $\alpha=5\%$, misunderstood; $\beta=0.2$; both specified *before* the experiment; critical regions; power)
- at this time testing individual hypotheses (no multivariable regression) and doing calculations mostly by hand
- misunderstanding and over-interpretation of p values (= probability of null hypothesis; "the definition assumes that the null hypothesis is true, it’s obvious that it can’t tell us about the probability that the null hypothesis is true" Calquhoun); sometimes people have been taught the misconception (abuse of statistics is passed on from generation to generation); p values exist only in a world where the null hypothesis is true
- the p value is not the false positive risk; alpha is probability of rejecting true difference, a property of the test not the data; start thinking of a study as a screening test
- the p value is not the probability that your results occurred by chance
- $P(data|hypothesis) \neq P(hypothesis|data)$; "the error of the transposed conditional": Colquhoun; $P(catholic|pope) \neq P(pope|catholic)$; P(al fresco defecation|bear) does not equal P(bear|al fresco defecation)
- BUT "What you want is the probability that the null hypothesis is true given the observations.": Colquhoun
- misunderstanding of significance
- don't use the term "statistically significant"; ditch p<0.05
- see Fig 3 of <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2816758/> e.g. in an outbreak if we test 20 hypotheses (e.g. 20 menu items at a wedding outbreak) of which one has a true association, with $\alpha=.05$ and $\beta=0.2$, then a significant p value has low predictive value; at extreme, predictive value may be 0; Jeffreys-Lindley paradox
- another example: 1000 studies, with p value cut-off of 0.05 and average 50% power ([consistent with published literature](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1119478/)), where in 900 the null hypothesis is true and in 100 it is false; we get 5% of 900 and 50% of 100 = 95 significant results of which 45 are misleading (predictive value of ~50%); usually we don't know the proportion of true null hypotheses
> "If you observe a p value close to 0.05 and conclude that you’ve discovered something, then the chance that you’ll be wrong is not 5%, but is somewhere between 20% and 30% depending on the exact assumptions you make. If the hypothesis was an implausible one to start with, the false positive risk will be much higher." [David Colquhoun](http://www.dcscience.net/2020/10/18/why-p-values-cant-tell-you-what-you-need-to-know-and-what-to-do-about-it/)
- strength of evidence -> yes/no based on p value (0.049 vs 0.051); publication bias
- or show confidence intervals? (also frequently misunderstood - great picture at <https://twitter.com/i/web/status/1225703930430140418>) or use 90% confidence intervals?
- can adjust p value cut-off?
- or interpret p values according to context? e.g. greater scepticism for results of data dredging
- do bigger studies?
- or with greater precision?
- or present false positive rate; need priors, likelihood ratios/Bayes factors
- model selection; stepwise methods
- multiple testing

### Interpretability

- $P(H_1|D)$ from Bayes rule easier to interpret than $P(D|H_0)$

### Flexibility

- complex models
- small data sets

### Incorporating prior beliefs

- outbreaks
- surveillance (streaming data)
- but prior belief can be difficult to quantify

### Spatial epidemiology

- ...

BUT

### Elicitation

- ...

### Interpretation

- ...

### Too hard?

- Statistics is already hopelessly misunderstood and misapplied; could Bayesian thinking actually simplify things?

### Older notes below

Probability is measure of plausibility or belief

More explicit, esp re assumptions, and less black box

More computationally intensive

Prior distribution updated to posterior distribution

Posterior is pseudodata

Shrinkage

Many parameters

MCMC

- checks, burn-in, number of samples, number of chains, thinning, plots, diagnostics
- Gibbs sampler
- Metropolis Hastings
- Hamiltonian

Convergence

Data known and fixed, parameters random

Still need to specify/select model

- likelihood
- BMA

Likelihood is probability of data given parameters

Prior is probability of parameters

Elicitation

Priors

- based on previous research or expert assessment
- vague/uninformative
- weakly informative

Hyperparameters and hierarchical models

Probability distributions

Software

- Stan
- coda package
- rstanarm
- brms
- shinystan
- bayesplot
-

Stan

- specify data
- then parameters


Run Stan!

? generate dummy data with given odds ratios

Sources

- Colquhoun
- <http://www.onemol.org.uk/Gigerenzer-2004.pdf>

## Further reading

<https://open.hpi.de/courses/bayesian-statistics2023>

