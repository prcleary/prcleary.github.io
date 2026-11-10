---
title: "OpenELIS versus SENAITE as LIMS options"
date: 2023-01-19
tags:
  - SENAITE
  - OpenELIS
  - LIMS
---

Although [OpenELIS](http://openelis-global.org/) seemed to be the most integrated LIMS option, I have installed it several times now, with problems every time. The first time I installed it directly on CentOS 7, the second time as Bahmini and the third and subsequent times using different versions of the installers for Ubuntu.

In brief my concerns about OpenELIS are:

- It looks quite old-fashioned, especially in comparison with DHIS 2.
- Even a fresh install comes with a lot of cruft related to its previous usage in other countries, e.g. logos, metadata for Haiti etc.
- The admin interface is quite clunky.
- At least one key part of the Web interface on a fresh install is often non-functional.
- I have spent more hours investigating obscure errors with variable success than I care to remember.
- OpenELIS doesn't seem as actively developed as you would like.
- The installation documentation is maddeningly vague in places.
- The online community is not as active as it could be.

This is why I have kept [SENAITE](https://www.senaite.com/) under consideration as a LIMS alternative. Part of the appeal is that SENAITE is Python-based; I feel better equipped for delving into obscure technical Python issues than I am for obscure Java issues. On the other hand, SENAITE is newer but seems to be actively developed with an active community of users. It also looks really good.

I don't give up easily, but I now think that for my own sanity I should draw a line under my attempts to set up a version of OpenELIS that I am satisfied with.

SENAITE is what I will primarily focus on evaluating henceforth. Another attractive feature is that SENAITE can be integrated with [OpenMRS](https://openmrs.org/) (for medical record keeping), [Odoo](https://www.odoo.com/) (for invoicing) and [Apache Superset](https://superset.apache.org/) (for data visualisation), which fits well with my use case. These components can easily be installed together as the very exciting [Ozone HIS](https://www.ozone-his.com/), which is currently available as a demo version but which should be ready for production use in the coming months. I currently have this running in a VM on Proxmox - it is a bit unstable currently (web services tend to go down mysteriously after running fine for a bit; also I am not convinced that any data is available to Superset) but it should be OK for evaluation purposes.

SENAITE itself can be a bit complicated to install by itself, as the installation instructions on the website are a bit of a mess, with confusion about installation of different versions, but it's all Python so I should be able to work it out.

