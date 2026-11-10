---
title: "DHIS 2 version 3.9 - wow"
date: 2022-12-04
tags:
  - DHIS 2
  - RapidPro
---

[DHIS 2.39 Overview](https://dhis2.org/releases/version-239/)

Some amazing new features in the latest version of DHIS 2, which is truly leading the way in rich and featureful open source information systems

- **Earth Engine population data import** - this will be really useful, particularly if denominators are available below district level or for arbitrary geographies - looks like you can go down to 1km cell size from [here](https://developers.google.com/earth-engine/datasets/catalog). Also looks like the denominator field is populated data element by data element, rather than as a separate data set as you would probably do it yourself, so it could increase the database size substantially if used immoderately.
- Looks like the first stage of **Tracker data entry** has been streamlined (fewer clicks)
- **Aggregate data exchange**: an add-on allowing a Tracker instance of DHIS 2 to send aggregate data to another instance
    - This could be really useful for more complex deployments, e.g. where you have a central "hub" used for analytics of integrated data and various "spokes" running instances for other purposes.
	- Note that it is best practice to run more sensitive case-based data collection on separate instances.
- **Redis** integration for clusters: a DHIS 2 cluster is when you run multiple instances of DHIS 2 which synchronise and act as though a single instance of DHIS 2 was running from the user viewpoint; useful for high availability of your service to users; Redis is a fast messaging/data store that enables this.
- **RapidPro** integration: now easier to integrate SMS-based data collection

It used to be said that you should not immediately upgrade to the latest version of DHIS 2 unless you were highly motivated to contribute to open source bug fixing. The version a couple of minor versions before latest was regarded as stable, with fewest unresolved bugs but still actively maintained. Older versions are not actively maintained apart from in exceptional circumstances.

I wonder if that is still true. For other web apps like Django, the advice seems to be that you can use the latest version but wait until the first patch version when the worst bugs should have been addressed. Some of the features in the latest version of DHIS 2 seem like "must haves".
