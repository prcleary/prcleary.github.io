+++
title = "Update on progress with SENAITE laboratory information management system configuration"
+++

I am currently working on the implementation of a laboratory information management project using SENAITE.
As previously with DHIS 2, I am learning as I go: how to install it, how to pronounce it (*senn-**ite*** I think), how to make it secure, how to configure it for the specific context where it will be used, maintenance, troubleshooting, working with users, how to integrate it with other data processes, etc etc.

I keep discovering really useful features.
Partly this is because SENAITE built on the full-featured Python-based content management system Plone (which I've seen described as the "800lb gorilla" of Python CMSs), which is itself built on the fairly capable web app platform Zope. 
Zope and Plone have both been around a long time, though it seems they don't get as much attention as Flask and Django these days.

SENAITE also has a number of useful add-ons, including ones for better capture of patient data (`senaite.diagnosis` and `senaite.patient`), for capturing antimicrobial susceptibility (`senaite.ast`) and for receiving data from lab instruments (`senaite.instruments`). 
The API is also implemented as an add-on (`simplejson`).

I've realised I am probably going to need to learn a lot more about Plone and Zope. 
Zope (and therefore SENAITE) stores data as "objects" rather than in a relational database, and I am starting to realise that the permissions for these can be complex. 

I have set up a demo instance of SENAITE on my own server, which allows me to test out/learn about things before adding them to the production instance. 

## Adding security headers

This is more of an Nginx Proxy Manager thing, but I got a better score (A+) at [Analyse your HTTP response headers](https://securityheaders.com/) by using the following headers:

```
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Content-Security-Policy' 'upgrade-insecure-requests';
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy strict-origin-when-cross-origin; 
add_header Permissions-Policy interest-cohort=();
```

It wasn't obvious to me at first how you can add security headers to NPM, so here is a picture of how you do it using a "Custom location".

<<gimg "https://drive.google.com/file/d/1KkmrEvB-7uiNrSHQP5Pd4dUI-aiDu9DX/view" 1000>>

There are additional headers I could have added, such as to hide the web server type/version, which I might add later. 

## Using SENAITE add-ons

There are three steps to using add-ons with SENAITE

- include them in your `buildout.cfg` file; mine now looks like this
	```
	eggs =
			Plone
			senaite.lims
			senaite.patient
			senaite.diagnosis
			senaite.microorganism
			senaite.ast
			senaite.instruments
			simplejson
	```
- rebuild the app as before (at the risk of further dependency issues potentially) with
	```bash
	PYTHONHTTPSVERIFY=0 buildout
	```
- enable the add-ons in SENAITE (Site Setup/Add-ons)
- you should then see some additional options in the LIMS Setup page, and some additional metadata if you have added `senaite.ast`

## Restart SENAITE on reboot

I was manually starting SENAITE, but realised that there would be reboots for maintenance and power outages, so I need SENAITE to start automatically when the system boots up.

There were a number of suggested ways of doing this, but in the end I used a similar approach to what I previously did for DHIS 2: [Starting Tomcat at boot time with Ubuntu 18.04 using systemd - Implementation - Implémentation - DHIS2 Community](https://community.dhis2.org/t/starting-tomcat-at-boot-time-with-ubuntu-18-04-using-systemd/36936)

You need to create a file with the following path and name: `/etc/systemd/system/senaite.service`

It should contain the following
```
[Unit]
Description=SENAITE
After=network.target

[Service]
User=senaite
Group=senaite
WorkingDirectory=/home/senaite/senaitelims
Type=forking
ExecStart=/home/senaite/senaitelims/bin/plonectl start
ExecStop=/home/senaite/senaitelims/bin/plonectl stop
ExecReload=/home/senaite/senaitelims/bin/plonectl restart

[Install]
WantedBy=multi-user.target
```

Then run the following commands: 

```bash
systemctl daemon-reload
systemctl enable senaite
systemctl start senaite
```

I rebooted the VM for good measure.
Now SENAITE starts itself automatically after a reboot.

## API

I will write more about the API later.
I am currently learning which endpoints allow me to read metadata - once there is some data in my demo system I can explore how to read that. 
It all seems really flexible but I will need to look into how I can authenticate requests from another machine.

It also seems that SENAITE can use WebDAV (file server protocol) as well - that might be useful for accessing reports etc.

## Bulk upload of setup data

I had intended to configure the system manually, but SENAITE does seem to have an option for uploading setup data in bulk, and that would save a ton of time if I can get it work.
The SENAITE project even provides a standard spreadsheet to capture setup data, though I am not sure if it is entirely up to date: [Bika and Senaite Setup data upload Template 1.9 - Google Sheets](https://docs.google.com/spreadsheets/d/1m56tIL24f-cBqMoWouzgtoRAyzNBPTUgbW9GHYMFdfY/edit#gid=936537807) 

As an admin, you can access the Import process from a button on the top menu (I didn't find this at first). 
At the moment I don't seem to have the right permissions to do this (even for the test data that comes with SENAITE), despite being an administrator, so I am trying to learn more about the permissions model. 
I might post something on the SENAITE forum if I can't figure this out myself. 
