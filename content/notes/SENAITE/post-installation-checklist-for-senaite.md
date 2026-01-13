+++
title = "Post-installation checklist for SENAITE"
+++

Congratulations if you have successfully installed SENAITE. This checklist follows on [here](@/notes/SENAITE/installation-senaite.md).

To save me retyping:

- `BASE_URL` refers to the base URL of your installation e.g. `https://senaite.myorg.net`
- `SITE_URL` refers to the SENAITE site you created e.g. `https://senaite.myorg.net/senaite`

**1. Consider installing additional useful tools for monitoring, security etc**

  ```bash
  sudo apt install htop neofetch tmux lynis
  ```
  
  - `htop` gives you a prettier list of running processes, sortable by RAM/CPU usage etc
  - `neofetch` displays information about your system (in future I think `fastfetch` may replace this)
  - `tmux` allows you to split your terminal into multiple screens, which is useful for monitoring several things at once
  - `lynis` gives you server hardening suggestions if you run `lynis audit system` as root
  
**2. Secure your system, e.g. SSH, firewall, other things suggested from the Lynis system audit or in [GitHub - imthenachoman/How-To-Secure-A-Linux-Server: An evolving how-to guide for securing a Linux server.](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server)**

  If you used the default admin password (`admin`) when building the app then you need to change it. According to the buildout file, you shouldn't be able to change it there:
  
  ```
  ############################################
  # Initial User
  # ------------
  # This is the user id and password that will be used to create the initial
  # user id that will allow you to log in and create a Plone site. This only
  # sets the initial password; it will not allow you to change an already
  # existing password. If you change the admin password via the web interface,
  # the one below will no longer be valid.
  # If you find yourself locked out of your Zope/Python installation, you may
  # add an emergency user via "bin/plonectl adduser".
  user=admin:admin
  ```
  
  You should be able to change your password here: `SITE_URL/password_form` but I got an error the first time I tried this, and was still able to log in with the old password. But after a few attempts, changing it both ways, I managed to change the admin password. You can find the admin password in the `adminPassword.txt` file in the buildout folder.

**3. Configure the system so that SENAITE restarts after the system has rebooted, as per [here](https://prcleary.github.io/#Update%20on%20progress%20with%20SENAITE%20laboratory%20information%20management%20system%20configuration).**

**4. Expose SENAITE to the Internet with an HTTPS URL.**

  I manage DNS through Cloudflare - for my demo installations I have been creating a subdomain and pointing it to the Nginx Proxy Manager LXC container running on Proxmox. Creating a "Proxy Host" on NPM allows me to obtain an SSL certificate and add security headers - more on that [here](https://prcleary.github.io/#Update%20on%20progress%20with%20SENAITE%20laboratory%20information%20management%20system%20configuration). There is more on Plone security in general here: [Plone Security Best Practices — Plone Documentation v5.2](https://5.docs.plone.org/manage/deploying/production/securitybestpractices.html)

**5. If you set up monitoring, you can use the following endpoints:**

  - `BASE_URL/@@ok`
  - `BASE_URL/ZopeTime`
  
  I often use [UptimeRobot: Free Website Monitoring Service](https://uptimerobot.com/), though I am thinking of switching to self-hosted [Uptime Kuma](https://uptime.kuma.pet/). 
  
  You could also install something like Netdata for monitoring resource utilisation: [Monitor your entire infrastructure in high-resolution and in real-time.](https://www.netdata.cloud/). 

**6. If required, add a rewrite rule to enable you to import setup data from a spreadsheet.**

  Because I was using an Nginx proxy, I had to add a rewrite rule to the config to get this to work (in NPM, Edit Proxy Host --> Advanced --> Custom Nginx Configuration).
  
  ```
  # Edit if your site is not called BASE_URL/senaite!
  rewrite ^(.*)$ /VirtualHostBase/$scheme/$host/senaite/VirtualHostRoot/$1 break;
  ```

I had an issue where SENAITE crashed trying to print invoices, which might have been due to this rule preventing SENAITE from finding things like fonts, so you probably want to remove this after any setup data is loaded.

**7. Enable any SENAITE add-ons you are using at `SITE_URL/prefs_install_products_form` - click "Install" for each.**

If you've forked and tweaked the add-ons then you need to do this each time after you have rebuilt the app.

**8. Customise/brand the appearance of your app**

  SENAITE doesn't offer different themes or allow you to easily re-skin the app with CSS, but you can add a logo and favicon and change the site title.
  
  `SITE_URL/setup` (Appearance tab) allows you to upload a logo and resize it with CSS (e.g. `height: 45px;`).
  
  In other `setup` tabs you will find options such as:
  
  - Allow the user to directly enter results after sample creation, e.g. to enter field results immediately, or lab results, when the automatic sample reception is activated.
  - Group analyses by category for samples
  - Analyses are required for sample registration
  - Set the email body text to be used by default when sending out result reports to the selected recipients. You can use reserved keywords: `$client_name`, `$recipients`, `$lab_name`, `$lab_address`
  
  You may also be able to change the logo at `SITE_URL/@@site-controlpanel`, though this didn't seem to work for me. This is where you can change the site title.
  
  You can generate a favicon from your logo: [Favicon Generator - Image to Favicon - favicon.io](https://favicon.io/favicon-converter/). Then follow the Bika LIMS instructions to add it: [LIMS browser Title and favicon. Banner colour — LIMS Collective](https://www.bikalims.org/manual/introduction-and-overview/client-facing-lab-portal/replace-you-lims-favicon), which are:
  
  - Replace the existing logo at `SITE_URL/portal_skins/senaite_images/favicon.ico/manage_main` (I am assuming your new favicon is also called `favicon.ico`)
  - Then change the TAL at `SITE_URL/portal_view_customizations/zope.interface.interface-plone.links.favicon/manage_main` (compare your URL - it is easy to end up in the wrong place changing the wrong thing) to:
  
  ```
  <tal:favicon define="portal_url view/site_url">
      <link rel="shortcut icon" type="image/x-icon" tal:attributes="href string:$portal_url/portal_skins/custom/favicon.ico" />
      <link rel="apple-touch-icon" tal:attributes="href string:$portal_url/portal_skins/custom/favicon.ico" />
  </tal:favicon>
  ```
  
  - The site favicon may not change immediately - I haven't yet worked out if it is clearing the browser cache or restarting/rebuilding the app that makes it appear.
  
  You can select a default view at `SITE_URL/select_default_view` - I have been making the Samples view the default under "Choose a content item". Clicking on the logo will then always take you back to the main samples listing view.
  
  You can hide the SENAITE footer at `SITE_URL/@@manage-viewlets` under `ViewletManager: plone.portalfooter (plone.app.layout.viewlets.interfaces.IPortalFooter) --> Viewlet: plone.footer` - click "Hide". 
  
  I did find a way of altering what appears in the left panel (Clients, Batches, Worksheets, Methods, Patients by default) but for the life of me I can't remember what I did - probably something in `SITE_URL/@@navigation-controlpanel`.
  
**9. Configure SENAITE settings to your liking at `SITE_URL/@@overview-controlpanel`.**

  I have been tending to turn off anything that would be unnecessarily restrictive for a small non-accredited lab without many staff.

  Options here include:
  
  - Date and time related settings like timezone(s), etc
  - Email settings: you can use internal or external services
  - Security settings
  - Configuration Registry and Zope Management Interface (ZMI): experts only!
  - Impress settings: print settings and lab report templates 
  - Patient settings (if you are using the `senaite.patient` add-on), including:
    - Require Medical Record Number (MRN)
    - Allow to verify samples with a temporary MRN
    - Allow to publish samples with a temporary MRN
    - Display an alert icon on samples with a temporary MRN
    - Age, gender, address, marital status, race and ethnicity data entry options
    - Configuring additional patient identifiers
    - Share patient on sample creation 
    - Allow patients in clients 
  - SENAITE Registry: haven't found I needed to change much/anything here - not clear what the "Sample Header" bit is about. 

**10. Configure other settings to your liking at `SITE_URL/bika_setup`.**

  Options here include:
  
  - Automatic log-off: The number of minutes before a user is automatically logged off.
  - Allow access to worksheets only to assigned analysts
  - Allow to submit results for unassigned analyses or for analyses assigned to others 
  - Only lab managers can create and manage worksheets 
  - Currency, country, member discount and VAT rate
  - Group analysis services by category in the LIMS tables - helpful when the list is long
  - Group analyses by category for samples
  - Require sample analyses for sample registration
  - Immediate results entry
  - Add a remarks field to all analyses 
  - Automatic verification of samples when all results are verified
  - Allow self-verification of results 
  - Default count of Samples to add
  - Default layout/landing page
  - Enable the Results Report Printing workflow
  - Auto-receive samples when recreated
  - Turnaround times
  - Email body text and default recipients
  - Standard formats for identifiers e.g. for Patients/Medical Record Numbers

**11. Modify certain user-facing listings/forms.**

  - `SITE_URL/samples`: click the three dots (main panel, top left) to show/hide/reorder columns.
  - `SITE_URL/patients`: ditto
  - You can also show/hide/reorder fields in analysis requests, but you can only do this after you are able to add an analysis request - there is a "Manage Form Fields" link for users with appropriate permissions.
  
**12. Create or import metadata**

You can manually add users, tests etc but there is a particular sequence you should follow:

- Finish the steps above
-  You can enter laboratory and accreditation information at `SITE_URL/bika_setup/laboratory`. 
- Most of the following is done via `SITE_URL/@@lims-setup` and choosing from the buttons.
- Create *Lab Contacts* (the LIMS users, specifying their roles, login details etc) and *Laboratory Departments* - read [this](https://prcleary.github.io/#Quick%20start%20with%20SENAITE%20laboratory%20information%20management%20system%20configuration) as [the current quickstart documentation](https://www.senaite.com/docs/quickstart) didn't work for me.
  - Note that the *Lab Manager* role has the most permissions after the admin role; you will probably also need the *Analyst* and *Lab Clerk* roles; roles seem to determine more what you can *do* than what you can *see* (*Worksheets* are for controlling what analysts can see)
- Add *Laboratory Departments* e.g. Haematology, Serology
- Add *Clients* (the organisations sending samples to the lab, e.g. GPs, clinics, hospital wards) and *Client Contacts* (the individuals from those organisations that are communicated with)
- Add *Container Types*, *Containers* and *Preservations* (optional)
  - *Container Types* (categories of container e.g. blood collection)
  - *Containers* (specific types e.g. Blood Collection Tube (EDTA))
  - *Preservations* (types of sample preservation, e.g. viral transport medium)
- Add the metadata for individual samples/tests: 
  - *Sample Matrices* (categories of sample type - in a human health context it would be e.g. blood, urine, tissue)
  - *Sample Types* (e.g. whole blood, serum, plasma, bone marrow aspirate)
  - *Sample Points* (location of sampling - I have used this to capture a standardised geography attribute that I can use for analysis or integration with DHIS 2; it is a small tweak to `/home/senaite/buildout-cache/eggs/cp27mu/senaite.core-2.5.0-py2.7.egg/bika/lims/content/analysisrequest.py` to make this field mandatory)
	```
	   # Sample field
    UIDReferenceField(
        "SamplePoint",
        required=1,  # Paul woz ere
	```
	- If required, add *Manufacturers* and *Suppliers* of lab instruments
- Once the above is done, add *Methods* (aka *Analysis Methods*): for example, if a particular test could be done in different ways (e.g. a blood count could be done by manual or automated processes) then these can be specified separately for the same test - if you don't need this level of detail then just create one method called something like "Default method" as it will be shown in lab reports and will be needed later to avoid "No Method selected for this Service" errors.
- If required, add *Instruments* and other instrument-related information
- Add *Analysis Categories* and *Analysis Services*: Analysis Services just means tests e.g. Alanine aminotransferase, and Analysis Categories means category of tests e.g. "Liver function tests" and is used for grouping results in reports
  - you should associate each Analysis Service with an Analysis Category, a unique keyword (which you should not change later), a Method, a Laboratory Department, plus optionally specifying other things like price, unit and turnaround time. 
	- you also add Result Options for each test, e.g. the VDLR test can have "reactive" or "non-reactive" results.
- You can add *(Results) Calculations*, which allow you to use a bit of Python to derive a numeric result from one or more other numeric results.
- *Analysis Specifications* are where you enter reference range data; you can have e.g. different ones for males and females (these can be selected at sample registration)
- *Analysis Profiles*: this is where you specify panels of tests that are commonly done together and have one price, e.g. liver function tests.
- *Analysis Request (AR) Templates* are a convenient way to allow selection of prespecified tests/panels at sample registration; they can contain one or more Analysis Profiles and specify the sample type.
- There are lots of other things you can add (and I haven't even gone into the requirements for add-ons like `senaite.ast`) but the above ones are most important for an initial set up.

There is a way of importing metadata from a spreadsheet, which doesn't seem to be recommended but which does still work to some extent. A template is provided here: [Bika and Senaite Setup data upload Template 1.9 - Google Sheets](https://docs.google.com/spreadsheets/d/1m56tIL24f-cBqMoWouzgtoRAyzNBPTUgbW9GHYMFdfY/edit?gid=1857772669#gid=1857772669). This is set up with some internal dropdowns to help enter data in a consistent way. Note that any column with a yellow star is a required field. It is quite a complicated beast and at some point I hope to share a functioning more developed demo version that fixes existing issues. [Here](@/notes/SENAITE/senaite-setup-data-diagram.md) is my attempt at visually understanding the relationships between the many tabs. I only got this to work with relatively simple uploads and ended up entering most of the metadata manually.

There is a "Rubik's Cube" symbol on the right of the header bar; click the arrow to the right of it and select "Import", which takes you to a page with options to import either demo metadata or your own metadata.

Complete a copy of the online spreadsheet with your own information, deleting any demo information that is there. Download it as an Excel file (*.xlsx) and then (**important**) delete all rows below the rows containing your information (they contain formatting which borks the import to SENAITE). This takes time - for each tab, highlight the first blank row, use the Ctrl-Shift-Down keyboard combo and then right-click and select Delete. 

It is best to test the metadata import on a demo version of SENAITE before applying it to your production instance. You can run SENAITE in foreground mode while doing this (`bin/instance fg`) to see the server logs, or use something like `tail -f var/log/*`. If it doesn't work you will need to know what errors are appearing in the logs. 

- If you get a Python `AuthenticationError` then there may be a problem with your proxy server - see the rewrite rule tip above.
- If you get an `IndexError` then there is an issue with the spreadsheet.
- If you get a "not implemented" error then check the spreadsheet you are trying to upload is not open. 

Once you get through the import without showstopper errors, you will see that not all the information in the spreadsheet has been imported, most noticeably:

- Client Contacts do not import, seemingly because the format of that tab is wrong (edit: I think it is actually just hidden, so you will need to unhide it in the spreadsheet) - at some point I will try to fix this in the spreadsheet. The import code is here: [senaite.core/src/senaite/core/exportimport/setupdata/__init__.py at 2.x · senaite/senaite.core · GitHub](https://github.com/senaite/senaite.core/blob/2.x/src/senaite/core/exportimport/setupdata/__init__.py)
- Lab Departments do not import with their Managers
- Lab Contacts don't import with their Lab Departments

All of the above can be fixed manually afterwards in the Web interface. There are also some things that you can't do with the import spreadsheet, such as determining whether one or multiple results can be recorded for a particular test - e.g. for blood film they might want to record a number of things such as pencil cells or spherocytes, but these can be done manually. 

Note that this is not an "idempotent" process; if you import the spreadsheet twice during testing you will see that most of the information now appears twice in the system. Advice on getting rid of previously imported information is [here](https://prcleary.github.io/#Quick%20start%20with%20SENAITE%20laboratory%20information%20management%20system%20configuration). 

As a final word, for all the above, the Bika LIMS User Manual can be very helpful where SENAITE documentation is lacking: [User Manual — LIMS Collective](https://www.bikalims.org/manual). Bika LIMS is a predecessor system to SENAITE that still seems to be used in some places.
