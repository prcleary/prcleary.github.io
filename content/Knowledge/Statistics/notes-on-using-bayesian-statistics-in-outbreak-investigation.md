---
title: "Notes on using Bayesian statistics in outbreak investigation"
---

I recently had the opportunity to try out Bayesian methods in a large gastrointestinal disease outbreak. This was a case-case study, comparing cases of outbreak infection with cases of another gastrointestinal infection. Data were collected from different regions/countries, in different ways. There was no sampling; just all the data we could get, which is the standard approach.

## Study design

The Bayesian analysis was conducted in parallel with a conventional frequentist analysis. This was supposedly blinded, though I ended up being involved in both analyses, and the Bayesian analysis was presented before the frequentist analysis was complete.

We agreed in advance to use models with random intercepts for geographies. We also agreed in advance to do certain separate models based on subsets of the data (e.g. adults, children). Both analyses used the same cleaned data set.

The aim was to assess the value of *non-expert* Bayesian analysis in this scenario. While I know how to use Bayesian methods, I would call myself an enthusiast rather than an expert. So in principle we would use default options (e.g. for priors, samples, burn-in) unless adjustments were required to fit models, but then do some sensitivity analysis and checks.

We ended up with data from cases in the low hundreds in each group.

First impressions of Bayesian methods were positive.

### Speed and convergence

Though models took longer to fit (several minutes on an average laptop), results were available fairly quickly, and quicker than the frequentist analysis. There were no problems of note with convergence (see below regarding initial values), but weirdly RStudio would occasionally crash, seemingly irrespective of what you were doing (e.g. sometimes while running a `ggplot2` command).

### Handling separation and collinearity

The data had some issues of *quasi-complete separation* (where one level of an exposure variable perfectly predicts the outcome) and probably a degree of collinearity, which bedevilled the frequentist analysis (requiring abstruse tweaks to `lme4` options), but was easier to handle with a Bayesian approach. There were also a predominance of zeroes in most of the exposure variables.

### Model fit

All but one of the models seemed to fit well (see below).

### Shrinkage versus stepwise methods

There seem to be time advantages to using shrinkage rather than stepwise methods, where if you make one change to the data you may have to re-run everything.

### Interpretability

Epidemiologists seemed to find the results intuitive, and there were no complaints about the absence of p values. However, there was some tendency to use inappropriate interpretations, such as describing an effect as "significant" if the credible interval did not cross the null.

Credible intervals were understood (they are what they thought confidence intervals were after all). Bayes factors seemed to be easily understood, though perhaps in a p value-like way, with >10 as the cut-off; this was probably my fault. Weakly informative priors seemed to be understood. The difference between point and ROPE null hypotheses was *possibly* understood.

### Visualisation

The various packages give you some nice graphics (perhaps they all do this these days).

## Practical points

### Variable filtering

As we had data on I think 100s of possible exposures, we did an initial filtering. We dropped variables with fewer than 5 (or was it fewer than 10?) positive responses, arguing that those could not explain more than a tiny fraction of cases. We also dropped any duplicative/overlapping variables, retaining the more specific variable (e.g. dropping "exposure to pets" when we also had "exposure to dogs" and "exposure to cats"). We also looked for identical exposure variables which could cause fitting problems. `caret::findCorrelation` was also useful as a check.

### Model fitting with rstanarm

We used the `rstanarm` package throughout for the regression analysis.

```r
# Example code
library(rstanarm)
options(mc.cores = parallel::detectCores(),
        scipen = 99999)
model1 <- 
  case ~ ns(age, df = 4) +
  sex +
  exposure1 +
  exposure2 +
  (1 | geography)
fit1 <- stan_glmer( 
  model1,
  data = thedata,
  family = binomial('logit'),
  QR = TRUE,
  init = 0,
  seed = 51186)
```

### Priors

We used default weakly informative priors initially, though these were perhaps too diffuse (see below).

### Initial values

We found that we had to use init=0 (setting the chains to start at the null value), as the default random values refused to work.

### QR decomposition

We initially used QR = TRUE (QR decomposition) as we had so many exposure variables and were concerned about multicollinearity, but it gave similar (perhaps slightly larger) estimates to QR = FALSE.

### Variable types

Most of our variables were binary (0/1 coded); the only continuous variable was age. We discussed centring/scaling age, but were not convinced we needed to. We used a cubic spline to fit age (not Bayesian; just something I have always wanted to do): ns(age, df = 4) (cubic spline with 5 knots based on quantiles).

### Model checks

We did the model checks with the bayesplot package:

- rhat to check convergence
- mcmc_trace for trace plots
- pp_check for posterior predictive checks (good fit apparent for all the models except one non-mixed logistic regression model we did for one particular geography; still pondering that)
- check_collinearity (performance package) to check for collinearity

There are a lot more checks available in ShinyStan.

### Summarising results

Once you have fitted a model you can get a nice regression table with parameters from the parameters package. There are other functions for looking at estimates and credible intervals, but don't assume they give 95% intervals without checking, as some give e.g. 90%; we stuck with 95% for familiarity. You can plot your model (use the pars argument to specify which estimates you want to show). mcmc_areas (bayesplot package) gives you some nice visualisations of the posterior distributions.

### Bayes factors

You can get Bayes factors with the bayestestR package. bf_rope gives ROPE Bayes factors, where the null hypothesis is that the parameter is zero or trivially different from zero.

### Sensitivity analysis

For sensitivity analysis we tried different priors.

A less weakly informative prior, prior=normal(0, 1), gave results more in the ballpark expected (we were not expecting to see large effects).

A "half-Cauchy" prior, prior=student_t(1, 0, 2.5), showed no major differences.

We did not try different priors for the random intercepts, or the overall intercept, but we could have.

Note that rstanarm does "autoscaling" where you have not specified the scale on your priors (i.e. it guesses based on the data). Some see this as empirical Bayesian, but that did not bother us.

## Next steps

Next steps are to compare the Bayesian with the frequentist results.

- Useful links
	- [14 Separation | Updating: A Set of Bayesian Notes](https://jrnold.github.io/bayesian_notes/separtion.html)
	- [A weakly informative default prior distribution for logistic and other regression models - priors11.pdf](http://www.stat.columbia.edu/%7Egelman/research/published/priors11.pdf)
	- [Bayesian Regression Models: Choosing informative priors in rstanarm - bayesian-regression-models.pdf](https://strengejacke.files.wordpress.com/2017/12/bayesian-regression-models.pdf)
	- [Bayesian generalized linear models with group-specific terms via Stan — stan_glmer • rstanarm](https://mc-stan.org/rstanarm/reference/stan_glmer.html)
	- [Cauchy and other shrinkage priors for logistic regression in the presence of separation - wics.1478.pdf](https://wires.onlinelibrary.wiley.com/doi/am-pdf/10.1002/wics.1478)
	- [Checking model assumption - linear models • performance](https://easystats.github.io/performance/articles/check_model.html)
	- [Dealing with separation in logistic regression models](http://www.carlislerainey.com/papers/separation.pdf)
	- [Fit a model with Stan — stan • rstan](http://mc-stan.org/rstan/reference/stan.html)
	- [How Should You Think About Your Priors for a Bayesian Analysis? | Steven V. Miller](http://svmiller.com/blog/2021/02/thinking-about-your-priors-bayesian-analysis/)
	- [How to Use the rstanarm Package • rstanarm](http://mc-stan.org/rstanarm/articles/rstanarm.html)
	- [Innocent little models won't fit in rstanarm](https://groups.google.com/g/stan-users/c/PsxD2Gl4Lbk?pli=1)
	- [Prior Choice Recommendations · stan-dev/stan Wiki](https://github.com/stan-dev/stan/wiki/Prior-Choice-Recommendations)
	- [Prior Distributions for rstanarm Models](https://cran.r-project.org/web/packages/rstanarm/vignettes/priors.html)
	- [Prior distributions and options — priors • rstanarm](https://mc-stan.org/rstanarm/reference/priors.html)
	- [README](https://cran.r-project.org/web/packages/bayestestR/readme/README.html)
	- [Robust Statistical Workflow with RStan](https://mc-stan.org/users/documentation/case-studies/rstan_workflow.html)
	- [Should I use fixed effects or random effects when I have fewer than five levels of a grouping factor in a mixed-effects model? - PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8784019/)
	- [The QR Decomposition For Regression Models](https://mc-stan.org/users/documentation/case-studies/qr_regression.html)
	- [Understand and Describe Bayesian Models and Posterior Distributions • bayestestR](https://easystats.github.io/bayestestR/index.html)
	- [bayesf22 Notebook - 13: Logistic regression](https://bayesf22-notebook.classes.andrewheiss.com/bayes-rules/13-chapter.html)
	- [r - Reporting guideline for bayesian using pd and ROPE - Cross Validated](https://stats.stackexchange.com/questions/533014/reporting-guideline-for-bayesian-using-pd-and-rope)
	
