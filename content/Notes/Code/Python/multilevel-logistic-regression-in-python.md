---
title: Multilevel logistic regression in Python
date: 2023-03-21
tags:
  - Statistics
  - Python
---

Run in RStudio via `reticulate` package.

```python
# multilevel.py

# py_install('pandas')
# py_install('pyreadstat')
# py_install('statsmodels')

# Packages
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

# Read data
df = pd.read_stata('Multilevel_Model_TB-HIV.dta')

# Data type conversions
df.info()
df.success.replace(('Yes', 'No'), (1, 0), inplace=True)
df['success'] = pd.to_numeric(df['success'])
df.HIV.replace(('Positive', 'Negative'), (1, 0), inplace=True)
df['HIV'] = pd.to_numeric(df['HIV'])
df.sex.replace(('Female', 'Male'), (1, 0), inplace=True)
df['sex'] = pd.to_numeric(df['sex'])

# Fit random intercepts model
md = smf.mixedlm('success ~ HIV', df, groups=df['country'])
mdf = md.fit()
print(mdf.summary())
print(np.exp(mdf.params))
```

Don't think it is possible to do random slopes model yet.

