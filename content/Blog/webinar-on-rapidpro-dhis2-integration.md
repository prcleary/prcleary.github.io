---
title: "Webinar on RapidPro-DHIS2 integration"
date: 2023-03-29
tags:
  - DHIS 2
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/Yvkvyefa3fo?si=iBaxIiLheVpIAKk8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Joined an excellent webinar last week, presented by Bob Jolliffe and colleagues, on integrating [[tags/DHIS-2]] with [RapidPro](https://app.rapidpro.io/). RapidPro is a web service allowing you to send and receive SMS messages from DHIS 2 (which is what we've been interested in using it for) - you can also use it for other things like Telegram too. It seems to be developed under the aegis of UNICEF and I think you need to get access to it via UNICEF. UNICEF have been working with the University of Oslo to develop a "connector" between DHIS 2 and RapidPro, based on Apache Camel integration engine, for reporting aggregated (and ultimately case-based) data and sending reminders.

They presented a demo and it all seems quite robust to common issues such as power or network outages. You do have to format your SMS message correctly, which might limit the complexity of data you could collect via SMS. Reporting 33 conditions would be tricky.

> "Using it for large routine reports is not a great use case." (BJ)

The RapidPro server they used was [here](https://rapidpro.dhis2.org/api/v2/), though you need an API token to use it. Then they ran the `rapidpro2dhis2.jar` file on an Ubuntu machine, giving as parameters the API URLs for RapidPro and a DHIS 2 instance running on Linode, as well as a parameter indicating the codes to use. You can log in to the connector via a Hawtio Web console to examine the status of requests.

It looks like you need to configure codes for data sets in DHIS 2 as that is what RapidPro uses in its "flow" definitions.

There was mention of how they are using SMS to send data from the DHIS 2 Android app in Sierra Leone, but not much detail. I am still not sure if we need this - there are many areas still without mobile coverage, where SMS is no use, but this would only be useful where there is mobile telephony coverage but not enough for mobile Internet.

There was some talk of [FHIR (Fast Healthcare Interoperability Resources)](https://www.hl7.org/fhir/), a healthcare data standard that seems to be the way forward and is already used by OpenMRS and other similar platforms, but not by DHIS 2 yet (translations are on-going). It isn't essential for the RapidPro-DHIS 2 connector.

There is more information [here](https://developers.dhis2.org/blog/2022/12/dhis-to-rapidpro-in-the-field/) - code is [here](https://github.com/dhis2/integration-dhis-rapidpro).

Really good webinar - will try to join more.

I have also been looking at [OpenFN](https://openfn.org/) as another integration option - there is some code [here](https://openfn.org/) though it doesn't look as well developed.
