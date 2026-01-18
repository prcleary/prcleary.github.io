+++
title = "How to create a Bluesky feed"
+++

- You need a Bluesky account, and to create an app password in the Bluesky site: Settings --> Privacy and Security --> App passwords
- Next log in to [SkyFeed](https://skyfeed.app/) with your Bluesky user name and the app password from the previous step
- SkyFeed has quite a busy interface - what you are looking for is "Feed Builder" (in the left hand column) then "Create Feed" at the top of the interface that opens 
- You can then add blocks - these run from top to bottom - mine were:
	- Input: entire network, 7 days
- Remove: if item is reply
- Remove: duplicates
- Regex with "Invert" ticked: add a regular expression here to filter out patterns you don't want - use `\b` to delineate words, e.g. `\bsex\b` will remove posts with "sex" but not "Essex"
- Regex with "Invert" not ticked: add a regular expression for what you want here - mine is below (used lots of trial and error and help from chatbots)
```
(?i)(📈🤖|🤖📈|(^|[^a-z0-9_])(rstats|pydata|duckdb|polars|dataviz|quartopub|parquet|data.table|apache[ -]?airflow|kubernetes|podman)([^a-z0-9]|$)|(^|[^a-z0-9_])bayes(ian)?s?([^a-z0-9_]|$)|causal[ -]*inference|(^|[^a-z0-9])(medsky|medtwitter|epidemiology|episky|publichealth)([^a-z0-9_]|$)|(^|[^a-z0-9_])(fhir|ehr|emr|hl7|openhie|openfn|apache[ -]?camel)([^a-z0-9]|$)|dhis[ -]?2|(^|[^a-z0-9])(proxmox|nextcloud|openrefine)([^a-z0-9_]|$)|(^|[^a-z0-9_])(senaite|openelis|lims|loinc)([^a-z0-9_]|$)|(^|[^a-z0-9_])rust(lang)?([^a-z0-9_]|$)|(^|[^a-z0-9_])#(idsky|statsky|idepi|foss|publichealth|python)\b)|(^|[^a-z0-9_/:])(docker)([^a-z0-9_]|$)
```
- Sort by: creation date, descending

You can see the result of mine here: [EpiNerd — Bluesky](https://bsky.app/profile/paulcleary.net/feed/aaadvpxlfawji) - it still includes some weird things but works mostly



