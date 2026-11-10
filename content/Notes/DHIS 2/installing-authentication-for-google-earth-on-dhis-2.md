---
title: "Installing authentication for Google Earth on DHIS 2"
date: 2022-10-29
tags:
  - DHIS 2
---

This is a bit of a complicated process. You require a Google account but it should be free to create a service account.

There are 5 steps here: <https://docs.dhis2.org/en/topics/tutorials/google-earth-engine-sign-up.html> - do not skip any. The first four require you to use your Google account to create a service account and then create and download a JSON private key. It's not made entirely clear from the DHIS 2 documentation, but you also need to register the service account to use Earth Engine - see the appropriate section of <https://developers.google.com/earth-engine/guides/service_account>.

You should change the name of the private key to `dhis-google-auth.json`.

The last step requires you to log into the server/VM running DHIS 2, upload the private key you got the from the initial steps (using e.g. `scp` or FileZilla) and change its permissions (see below for code for moving the file to the right location and ensuring the right permissions for the file). There is more detail on step 5 here: <https://docs.dhis2.org/en/manage/performing-system-administration/dhis-core-version-239/installation.html#install_google_service_account_configuration>

```bash
sudo mv dhis-google-auth.json /home/dhis/config/
sudo chown dhis:dhis /home/dhis/config/dhis-google-auth.json
```

You need to restart DHIS 2 (or reboot the VM/server) for DHIS 2 to reload its configuration. After that the Google Earth data sources (precipitation etc) should be accessible in the Maps app.

