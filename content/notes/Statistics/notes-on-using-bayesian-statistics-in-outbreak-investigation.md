+++
title = "Notes on using Bayesian statistics in outbreak investigation"
+++

- recently had the opportunity to try out Bayesian methods in a large gastrointestinal disease outbreak 
- case-case study, comparing cases of outbreak infection with cases of another gastrointestinal infection
- data collected from different regions/countries, in different ways
	- no sampling; just all the data we could get (standard approach)
- Bayesian analysis conducted in parallel with conventional frequentist analysis
	- supposedly blinded, though I ended up being involved in both analyses, and the Bayesian analysis was presented before the frequentist analysis was complete
	- agreed in advance to use models with random intercepts for geographies
	- agreed in advance to do certain separate models based on subsets of the data (e.g. adults, children)
	- used the same cleaned data set for analysis
- The aim was to assess the value of *non-expert* Bayesian analysis in this scenario (while I know how to use Bayesian methods, I would call myself an enthusiast rather than than an expert)
	- so in principle we would use default options for (e.g. priors, samples, burn-in) unless adjustments were required to fit models, but then do some sensitivity analysis and checks
- ended up with data from cases in the low hundreds in each group
- first impressions of Bayesian methods were positive
	- though models took longer to fit (several minutes on an average laptop), results were available fairly quickly, and quicker than the frequentist analysis
	- no problems of note with convergence (see below re initial values) but weirdly RStudio would occasionally crash (seemingly irrespective of what you were doing - e.g. sometimes while running a `ggplot2` command)
	- the data had some issues of *quasi-complete separation* (where one level of an exposure variable perfectly predicts the outcome) and probably a degree of collinearity, which bedevilled the frequentist analysis (requiring abstruse tweaks to `lme4` options), but was easier to handle with a Bayesian approach
		- there were also a predominance of zeroes in most of the exposure variables
	- all but one of the models seemed to fit well (see below)
	- there seem to be time advantages to using shrinkage rather than stepwise methods (where if you make one change to the data you may have to re-run everything)
	- epidemiologists seemed to find the results intuitive (and there were no complaints about the absence of p values)
		- however there was some tendency to use inappropriate interpretations (e.g. describing an effect as "significant" if the credible interval did not cross the null)
		- credible intervals were understood (they are what they thought confidence intervals were after all)
		- Bayes factors seemed to be easily understood (though perhaps in a p value-like way, with >10 as the cut-off - this was probably my fault)
		- weakly informative priors seemed to be understood
		- the difference between point and ROPE null hypotheses was *possibly* understood
	- the various packages give you some nice graphics (perhaps they all do this these days)
- Practical points
	- as we had data on I think 100s of possible exposures, we did an initial filtering
		- we dropped variables with <5 (or was it <10?) positive responses, arguing that those could not explain more than a tiny fraction of cases
		- we also dropped any duplicative/overlapping variables, retaining the more specific variable (e.g. dropping "exposure to pets" when we also had "exposure to dogs" and "exposure to cats")
		- we also looked for identical exposure variables which could cause fitting problems
			- `caret::findCorrelation` was also useful as a check
	- we used the `rstanarm` package throughout for the regression analysis
		```
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
	- we used default weakly informative priors initially (though these were perhaps too diffuse - see below)
	- we found that we had to use `init=0` (setting the chains to start at the null value), as the default random values refused to work
	- we initially used `QR = TRUE` (QR decomposition) as we had so many exposure variables and were concerned about multicollinearity, but it gave similar (perhaps slightly larger) estimates to `QR = FALSE`
	- most of our variables were binary (0/1 coded); the only continuous variable was age
		- we discussed centring/scaling age, but weren't convinced we needed to 
		- we used a cubic spline to fit age (not Bayesian; just something I have always wanted to do): `ns(age, df = 4)` (cubic spline with 5 knots based on quantiles)
  - did the model checks with the `bayesplot` package:
    - `rhat` to check convergence
    - `mcmc_trace` for trace plots
    - `pp_check` for posterior predictive checks (good fit apparent for all the models except one (non-mixed) logistic regression model we did for one particular geography - still pondering that)
    - used `check_collinearity` (`performance` package) to, er, check for collinearity
    - there are a lot more checks in `ShinyStan`
  - once you have fitted a model you can get a nice regression table with `parameters` from the `parameters` package
    - there are other functions for looking at estimates and credible intervals (but don't assume they give 95% intervals without checking - some give e.g. 90%; we stuck with 95% for familiarity)
    - you can `plot` your model (use `pars` argument to specify which estimates you want to show)
    - `mcmc_areas` (`bayesplot` package) gives you some nice visualisations of the posterior distributions
  - you can get Bayes factors with the `bayestestR` package:
    - `bf_rope` for ROPE Bayes factors (where the null hypothesis is that the parameter is zero *or trivially different from zero*)
  - for sensitivity analysis we tried different priors
    - a less weakly informative prior: `prior=normal(0, 1)` 
			- the results of this were more in the ballpark expected (we were not expecting to see large effects)
    - a "half-Cauchy" prior: `prior=student_t(1, 0, 2.5)` 
			- no major differences observed
    - we didn't try different priors for the random intercepts, or the overall intercept, but we could have
  - note that `rstanarm` does "autoscaling" where you haven't specified the scale on your priors (i.e. it guesses based on the data - some see this as empirical Bayesian, but that didn't bother us)

Next steps are to compare the Bayesian with the frequentist results...

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
	
