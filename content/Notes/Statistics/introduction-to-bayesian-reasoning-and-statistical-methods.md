---
title: Introduction to Bayesian reasoning and statistical methods
date: 2022-10-31
tags:
  - Statistics
  - Bayesian
---



[NB: diagrams not shown]

### Bayesian statistics

Statistical inference in which evidence or observations are used to update the probability that a hypothesis is true.

"A Bayesian is one who, vaguely expecting a horse, and catching a glimpse of a donkey, strongly believes he has seen a mule."

1. Start with existing probability (prior probability)
2. Combine that with new evidence
3. Obtain an updated probability (posterior probability)

### Origins of Bayesian statistics

Posthumous publication of work by Rev. Thomas Bayes, clergyman and statistician (1763)

First known derivation of a posterior probability distribution ("inverse probability")

Later developed more formally by Pierre-Simon Laplace (1775)

### Bayes’ theorem

$P(hypothesis|evidence) = P(hypothesis) \times \frac{P(evidence|hypothesis)}{P(evidence)}$

For example:

- Hypothesis: person has a disease
- Evidence: person has a positive test for the disease
- What is the probability of my hypothesis given the evidence? i.e. what is the probability the person has the disease if their test is positive?

$P(disease|positive) = P(disease) \times \frac{P(positive|disease)}{P(positive)}$

### Application of Bayes’ theorem

What is the probability a patient has HIV infection if

- the test is positive
- the patient is a female in Wales with no risk factors for HIV (HIV prevalence in this population thought to be 0.03%)
- our enzyme immunoassay test for HIV is 99.7% sensitive and 98.5% specific?

[from prevalence] $P(disease) = 0.0003$

 [from sensitivity] $P(positive|disease) = 0.997$

In a notional population of one million Welsh females who are all tested

- 300 people will have HIV (of whom 299 will be positive when tested)
- 999,700 people will not (of whom 14,996 will have false positives)

so $P(positive) = (299 + 14996)/1000000 = 0.016$

$P(hypothesis|evidence) = 0.0003 \times \frac{0.997}{0.016} = 0.019$

The probability of HIV infection in this individual is still low despite the positive test result

- before the test we believed that our patient had a probability of 3 in 10,000 of HIV
- after the positive test we believe that our patient has a 2 in 100 probability of HIV

Note that we started with a (prior) probability and ended with a (posterior) probability

- we could do another (different) HIV test and update our belief again
- the posterior probability we have just calculated would become our prior probability in the new calculation

But:

- what do we mean by "probability" here?
- how do we express uncertainty in our probabilities?

### "Frequentist" definition of probability

Classical statistics defines probability as the proportion of times outcome of interest would occur in hypothetical infinite sequence

Don't have hypothetical long run of events in many situations

- e.g. probability of World War III breaking out in next 4 years

These events are not repeatable

- so there is no hypothetical long run of events
- can't have probabilities in classical statistics
- but can in Bayesian paradigm: **probabilities are expressions of belief**

### Incorporating uncertainty

Probability distribution: formula linking each possible outcome to its probability of occurrence

Prior probability as distribution

Evidence as **likelihood** (NB: data fixed, parameter random)

### Two practical issues with this

Need to express our prior belief as a probability distribution

Need to be able to combine the prior with the likelihood mathematically to get the posterior

### Priors

Priors utilise prior information

- can give more precise estimates in some situations, e.g. small samples

Several methods of “elicitation”
- e.g. using quantiles of distribution

If no prior evidence can have "uninformative" priors (aka weak/vague/flat priors)

But: *only certain prior-likelihood pairings can be combined mathematically*

### Monte Carlo Markov Chain (MCMC) methods

Since 1990s, computational algorithms now allow us to estimate the posterior distribution even when extremely complex

One common algorithm is based on taking random samples from known components of the posterior distribution

- iterative process, using each estimate to (sort of) improve the next one
- with the right algorithm, after a large number of samples, effectively sampling from the posterior distribution
- end up with large number of samples from posterior distribution, from which we can calculate any summary statistics of interest

Markov Chain: random process in which each value depends only on the previous value

- under certain conditions will reach a unique equilibrium (converge)

Monte Carlo simulation: learning about processes by taking random samples from them

MCMC examples

- Metropolis-Hastings algorithms
- Gibbs sampling

### Bayesian statistics in practice

Specify model for data

Specify distributions describing prior belief about parameters

Obtain initial value for each parameter (various ways of doing this)

Run algorithm for large number of iterations

Discard the early samples

Examine the remaining samples

Consider other priors or initial values (sensitivity analysis)

Select and assess final model

Report estimated parameters of interest with credible intervals

(Make predictions)

### Convergence

When should we stop the algorithm?

- Eyeballing
- Tests of convergence

Dealing with non-convergence

- different initial values
- different prior distributions

### Tools for MCMC inference

WinBUGS (Windows Bayesian analysis Using Gibbs Sampling)

- developed by Spiegelhalter et al at Cambridge in 1990s
- (relatively) easy to use
- can define models using special syntax (like R) / graphically
- works well with R (R2WinBUGS package)
- good for spatial models
- free
- can be slow (if chooses inefficient algorithm)
- cryptic error messages (“numerical overflow trap”)
- black box

OpenBUGS, JAGS (Just Another Gibbs Sampler), Stan (No U-Turn Sampler, or NUTS)

R: MCMCpack, MCMCglmm, prevalence, CARBayes, LaplacesDemon Stata

Python: PyMC

Integrated Nested Laplace Approximation (INLA): inference from Gaussian Markov Random Field models (computationally efficient alternative for some types of model, e.g. spatial)

### When to use Bayesian methods

Frequentist and Bayesian methods often give comparable results

Bayesian preferred when

- non-negligible prior belief (outbreaks?)
- ongoing stream of data (e.g. surveillance)
- analyses informing decisions (expected loss) e.g.
- cost-effectiveness analyses
- very complex models with lots of parameters
  - e.g. small area spatial models with correlation between neighbouring areas
- non-repeatable events
- other situations when classical methods non-applicable

### Bayesian methods in epidemiology

Now used in many areas of epidemiology

- Flexible modelling
- Intuitive interpretation
- Capture different types of variation
- Many tools available

But

- Learning curve
- More explicit about model assumptions
- Less easy to use as "black box" method

### Further reading

LeSaffre et al. Bayesian Biostatistics

Kruschke. Doing Bayesian data analysis.

Lawson et al. Bayesian disease mapping: hierarchical modelling in spatial  epidemiology.
