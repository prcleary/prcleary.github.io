+++
title = "Quick start with SENAITE laboratory information management system configuration"
+++

I [previously](https://prcleary.github.io/#Installing%20SENAITE%20laboratory%20information%20management%20system%20on%20Ubuntu) installed SENAITE on my test server and I have now installed a production instance on another server, using my notes from last time.


I wanted to document the setup steps, as the official documentation is incorrect and somewhat frustrating:  [A quick start into SENAITE · SENAITE](https://www.senaite.com/docs/quickstart).

There still seem to be some inconsistencies across browsers, though I am not yet sure if these would affect users. 
I started off using Edge, but had to switch back to Firefox to get the "create a new site" (see below) step working, then switched back to Edge when I again came up against the dropdown issues.
Once it is all set up and more fully configured, I will check browser compatibility again. 

As I played with my test version of SENAITE previously, I wanted to get rid of what I had set up previously. You can start afresh with:

```bash
cd /home/senaite/senaitelims
conda activate senaite  # Python virtual environment
bin/instance stop  # stop instance
rm var/filestorage/*  # remove previous stuff
rm -rf var/blobstorage  # remove other previous stuff
PYTHONHTTPSVERIFY=0 buildout  # rebuild the app
bin/instance start  # start instance
# bin/instance logtail  # (optional) monitor app logs
# bin/instance help  # (optional) see all instance commands 
```

SENAITE should now be accessible on port 8080 of your server and you can open it in your browser.

Next you create a site (you can have multiple sites on one instance) by clicking on "Create a new SENAITE site".

If you get an error page:

- try a different browser (Firefox worked for me when Edge wouldn't)
- try removing/fixing custom web server configuration (I tweaked mine experimentally but not sure it changed much)

To create a site you will need to provide the following:

- *path identifier*: this will be the final part of the URL for your site - if your server is available at `https://subdomain.domain.tld`, then putting "mylab" as your path identifier will mean your app will be available on `https://subdomain.domain.tld/mylab` 
- *title*: what will appear at the top of the browser tab (I put something short like "My lab")
- *language*: I left this as English
- *default timezone*: I changed this to Asia/Karachi

Then click "Create SENAITE site".

Go to the URL for your site e.g. `https://subdomain.domain.tld/mylab` if not taken there automatically

Log in with the admin credentials (if you have forgotten them, they are in the `buildout.cfg` file).

After logging in, first create a laboratory manager (not a laboratory department as in the instructions):

- top right in the browser window, next to your user name, is a cog icon - click on this
- look for the "Lab Contacts" button and click that
- (alternatively use the Ctrl-Space key combo and type Lab Contacts, then click the link with that name)
- click Add
- then complete the following fields (a dot means mandatory I think)
	- names (first and last name, plus *either* (not both) middle name or middle initial)
	- job title: Lab Manager (free text - use what you like)
	- leave Departments and Default Department blank at this stage 
	- Click Save

After saving, note that there is a button/tab at the top called "Login Details" - click on that - you will need to complete the following fields:

- user name (this will be the login name)
- password
- email
- under groups select Lab Manager
- save

Now you can create a Laboratory Department:

- click the cog then find and click Lab Departments, or use the keyboard combo to navigate to it
- click Add
- complete the following fields
	- title: e.g. Microbiology 
	- department ID: if the department already has a unique ID used in data then use that - I just used "micro"
	- manager: click in the empty field and you should get a dropdown where you can select the name of the manager you created (if you get an infinite spinner instead of a dropdown then try a different browser or change the web server config)
	- save

Now go back to Lab Contacts to set the default department of your lab manager

- click the lab manager entry in the list
- click Edit at the top (you may have to scroll up to see this)
- click in the empty field and select the default department of choice from the dropdown
- save

You can now follow the quickstart instructions to create other users with different roles, e.g. lab analysts. 
After that you can log out as admin and log in as lab manager to set up sample types, lab tests (try to follow this: [Home – LOINC](https://loinc.org/)), clients, etc. 

We are now epidemiologists treading with trepidation in a world of microbiology. 
