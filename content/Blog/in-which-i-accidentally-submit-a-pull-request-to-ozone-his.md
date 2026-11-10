---
title: "In which I accidentally submit a pull request to Ozone HIS"
date: 2023-03-29
---

I have been running the demo version of Ozone HIS, as [[checklist-for-setting-up-a-new-ubuntu-server-vm-in-proxmox-to-run-docker|mentioned previously]], but had to fork [the repo](https://github.com/ozone-his/ozone-docker) to try to address the following issues:

1. Java out-of-memory error
2. The VM invariably running out of disk space within days; I first thought it was the Docker logs and changed the maximum log size ([[my-docker-cheatsheet|see my Docker cheatsheet]]), but now I think it is an issue with [Zope](https://zope.dev/); SENAITE the LIMS software runs on [Plone](https://docs.plone.org/intro/index.html) the content management system, which runs on Zope the application server; Zope has a database which records every transaction, and can grow very large; once it reaches above 20Gb in my VM the system goes down.
3. Superset is not working (not accessing any data).

Last night I was syncing my fork and thought it was asking me to merge in upstream changes, but I hadn't noticed that I had somehow switched to the main developers repo and by clicking various buttons without thinking about it too much ended up submitting a pull request for some of my changes to the main repo (GitHub makes things too easy). I immediately realised what I had done and closed the pull request with an apology. I had also responded to [a query on the OpenMRS forum about the issue](https://talk.openmrs.org/t/ozone-openmrs-legacy-ui-cant-create-new-patient/38656/6). Luckily what I had submitted was only sensible changes to the default configuration for the Ozone HIS Docker deployment, so I got a friendly message from a couple of developers saying they would address the issue. Open source at its best. But I will be more careful with GitHub in future.
