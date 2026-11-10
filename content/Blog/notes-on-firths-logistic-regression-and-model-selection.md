---
title: "Notes on Firth's logistic regression and model selection"
date: 2022-12-04
tags:
  - R
  - Statistics
---

Problems can arise with fitting logistic regression models, particularly with small sample sizes and lots of explanatory variables. A clue that this is happening is very large estimates of standard errors or the model failing to converge (i.e. giving up trying to fit the model). This can arise because of what is called **separation**, which means that some combination of your explanatory variables perfectly (or nearly perfectly) predicts your outcome variable. To put this more intuitively: you are not giving the model fitting process any variability to work with, when it relies on variability in the data to give you things like confidence intervals.

A related issue is **multicollinearity**, when is when correlations between your explanatory variables cause problems for the model fitting process. When this occurs, R will often deal with this by just dropping an offending variable to be able to fit the model, but you can check for multicollinearity using the `vif` command in the `car` package and then choose which variables to exclude/combine yourself.

Obviously the best solution is to get more data, or restrict your analysis to a smaller number of explanatory variables. Or possibly consider Bayesian methods, particularly if you have prior information. But when this is not feasible, you can consider statistical methods which can deal with the issues outlined above.

Exact logistic regression is often considered, but this can be computationally intensive, may not be able to fit the more complex models that you want and can only handle a limited number of observations.

Penalised regression models modify the fitting process to add a constraint (the technical term is "penalty") to reduce "overfitting", i.e. producing a model which doesn't just fit to the relationships between your variables but also fits to the random noise in your sample data. What you want is a model that is generalisable: if you got some new data from the same source and fitted a model to it you would get the same model.

There are different types of penalised regression models, and these are generally implemented in the `glmnet` package. You may have seen references to "ridge regression" or "lasso regression" (or to "elastic net" which is a combination of both). These mainly vary in terms of which penalties are used. Ridge regression uses something called an L2 penalty, whereas lasso regression uses something called an L1 penalty. Basically if you know your model gives you biased estimates then the penalty is adding a bias in the opposite direction.

A popular option for small sample size logistic regression is Firth's logistic regression  which uses something called "Jeffrey's invariant prior" as a penalty to provide estimates even in the presence of separation. Firth, a statistician from the University of Warwick, developed this method initially as a way of reducing bias when fitting logistic regression models, and it was then discovered that this method could also handle separation. It has been described as the:

> [!quote] "...standard approach for the analysis of binary outcomes with small samples." 
> <https://onlinelibrary.wiley.com/doi/10.1002/sim.7273>

It can still be computationally intensive in some circumstances, but it has been suggested that we should use Firth's logistic regression for any sample sizes less than 100: <http://www.carlislerainey.com/papers/small.pdf>

(Note that the "10 positive outcomes per explanatory variable" rule of thumb seems to be going out of fashion, based on simulation studies. You may need 50 positive outcomes per explanatory variable if you are using stepwise methods: <https://asset-pdf.scinapse.io/prod/2809949684/2809949684.pdf>)

Firth's logistic regression can be done with the `logistf` or `brglm` packages in R. The `brglm` package seems to be being superseded by the `brglm2` package so we will stick to `logistf` package here.

There are two modifications to FLR, called FLIC and FLAC, which are implemented in the `logistf` package. They are probably only relevant if you are fitting a logistic regression model for prediction purposes. To use them replace the `logistf` command in the code below with either the `flic` or `flac` functions.


```r
library(epiDisplay)  # for Oswego outbreak data set
library(logistf)
data(Oswego)
options(scipen = 6)  # avoid scientific notation for small numbers

# Ordinary logistic regression
model_ordinary <-
  glm(ill ~ vanilla + bakedham + spinach,
      data = Oswego,
      family = binomial)
summary(model_ordinary)

# Firth logistic regression with logistf
model_firth <-
  logistf(ill ~ vanilla + bakedham + spinach, data = Oswego)
summary(model_firth)
```

### Stepwise methods

You can do forward or backward stepwise model selection with FLR, but the usual health warnings apply.

```r
# Backward stepwise regression
drop1(model_firth)
```

The `drop1` comma does a likelihood ratio test with the penalised likelihoods. A small p value should discourage you from dropping that variable. Here we could drop the `bakedham` variable as it has the biggest p value.

```r
model_firth_2 <- update(model_firth, . ~ . - bakedham)
summary(model_firth_2)
drop1(model_firth_2)
```

And so on - you would probably drop the `spinach` variable next.

```r
# Forward stepwise regression
model_firth <-
  logistf(ill ~ vanilla, data = Oswego)
add1(model_firth, scope = c('bakedham', 'spinach'))
```

Both p values are big so we would not want to add either of these variables.

Note that by default the `logistf` function will give you something called "profile confidence intervals" by default; if you don't want these for some reason then use the argument `pl = FALSE` which will give you "Wald confidence intervals". But if you have a small sample then you probably don't want to do this, as Wald confidence intervals don't perform well with small sample sizes.

---

Stata seems to test for adding/removing variables using an equivalent but longer-winded approach by fitting one model with a coefficient constrained to 1 and another one without that constraint and then comparing those with a penalised LRT: <http://fmwww.bc.edu/RePEc/bocode/f/firthlogit.html>

You can easily constrain an estimate to 1 using an `offset` term in R model syntax. I had to tweak the model fitting algorithm slightly to allow it to converge for a more complex model.

This gives the same p value as using `drop1` - recommend using `drop1` unless you have a reason for exactly mirroring Stata's slightly bizarro way of doing things.

```r
# Settings for logistf function: give the model more chance to converge
# Here slightly increased maximum iterations from default of 25
# and slightly decreased maximum step size from default of 5
ctrl <- logistf.control(maxit = 50, maxstep = 4)

# Firth model estimating spinach
model_firth <-
  logistf(ill ~ vanilla + bakedham + spinach,
          data = Oswego,
          control = ctrl)
summary(model_firth)

# Firth model contraining spinach estimate to 1
oswego <- data.table(Oswego)
oswego[, spinach := as.numeric(spinach)]
model_firth_constraint <-
  logistf(
    ill ~ vanilla + bakedham,
    offset = spinach,
    data = oswego,
    control = ctrl
  )

# Penalised LRT comparing original model with constrained model
anova(model_firth, model_firth_constraint)

# Compare p values to "drop1" approach
drop1(model_firth)
```

> [!note] I later realised that the `drop1` function is all you need - as it is a generic function the `logistf` package provides its own version.

