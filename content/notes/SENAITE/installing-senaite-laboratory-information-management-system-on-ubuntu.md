+++
title = "Installing SENAITE laboratory information management system on Ubuntu"
+++

Notes from my own recent installation:

- At the time of writing, the official installation instructions [here](https://www.senaite.com/docs/installation) **do not work**.

- There are a number of blog posts and [SENAITE Community](https://community.senaite.org) postings on the Internet with advice on installation, but none can be relied on alone for a successful installation. 
	- The closest I found to accurate and up-to-date installation instructions is this (contains some additional helpful tips): [Install Senaite on Ubuntu 18.04: A Step-by-Step Guide](https://senaite.hashnode.dev/installing-senaite-on-ubuntu-18-04)
	- You may also come across this one: [Complete setup guide, step-by-step - Technical - SENAITE Community](https://community.senaite.org/t/complete-setup-guide-step-by-step/137)
	
- There are Docker/Docker Compose options which seemed to work from limited experimentation but I didn't pursue these as I wanted to understand the technology stack.
	- Here is an example: [An Easy, Beginner's Guide, Step-by-Step Senaite Cloud Install with Digital Ocean and Docker - Google Docs](https://docs.google.com/document/d/1kHifKeMtz4MVniIXXBAraL3VfmI8Ctn6OcKhoD5Y724/edit#heading=h.g95b68l6qnss)
	
- The steps are (I haven't gone into detail  for the steps from the official documentation that worked):
	- Install Ubuntu 18.04 (I suspect you might get away with a more recent version of Ubuntu, or Debian Buster, but I haven't looked into this much)
		- I created a VM in my Proxmox setup with 4 vCPUs, 16GB of RAM and 100GB of storage (this was probably more than was needed for a demo version)
	- Create a user called `senaite` with `sudo` privileges and switch to being that user.
	- Install Miniconda (you can alternatively use `virtualenv`) to isolate the Python dependencies of SENAITE from system updates and then create and activate a Python virtual environment.
	- Install some system dependencies (these are the ones listed in the official instructions):

		```bash
		sudo apt install build-essential  libcairo2 libffi-dev libgdk-pixbuf2.0-0 libpango-1.0-0 libpangocairo-1.0-0 libxml2 libxml2-dev libxslt1-dev libxslt1.1 python2.7 python2.7-dev zlib1g zlib1g-dev 
		```	
		
	- I also installed some additional dependencies in my various attempts to install SENAITE (not sure if it made any difference):
	
		```bash
		sudo apt install bzip2 libbz2-1.0 libbz2-dev libexpat1-dev libjpeg-dev libjpeg-turbo8-dev libopenjp2-7-dev libpango1.0-0 libpcre3 libpcre3-dev libssl-dev libtiff5-dev python-pil 
		```
	- So far so good...
  - Install Plone: this is where things started going wrong, as you need a more recent version of Plone than is described in the official instructions; in my successful attempt I installed this version of Plone:
	
	```bash
	wget --no-check-certificate https://launchpad.net/plone/5.2/5.2.13/+download/Plone-5.2.13-UnifiedInstaller-1.0.tgz
	tar -xf Plone-5.2.13-UnifiedInstaller-1.0.tgz
	cd Plone-5.2.13-UnifiedInstaller-1.0
	./install.sh standalone --target=/home/senaite --instance=senaitelims --password=whateveryouwant --with-python=/home/senaite/miniconda2/envs/senaite/bin/python
	cd /home/senaite/senaitelims
	```
	
  - Next you need to edit the [`buildout.cfg` file](https://training.plone.org/mastering-plone-5/buildout_1.html) in a text editor; this is the configuration file that will be used to build your Plone app and resolve Python dependencies; the critical parts of mine look like this:
	
	```
	eggs =
      Plone 
      senaite.lims 
      simplejson
	# ...
	user = admin:whateveryouwant 
	# ...
	[versions]
	setuptools =
	zc.buildout =
	Plone = 5.2.11
	plone.recipe.unifiedinstaller = 5.2b1
	buildout.sanitycheck = 1.0.2
	collective.recipe.backup = 4.1.0		
	```
	
    - Note how (by accident) I didn't specify the right Plone version (and yet it worked); perhaps this just specifies minimum versions
  - I did not touch the `requirements.txt` file.
	- I did however install some specific Python package versions, which may have helped.
	
		```bash
		pip install zc.buildout==2.13.4
		pip install setuptools==44.1.1
		```
	
	- At some point I think I also followed some advice to change permissions with `sudo chown -R senaite:senaite /home/senaite/.cache` 
  - Now the moment of truth (or more likely of many errors): run the buildout script
	- If the script completes without error, then you can start an instance with `bin/instance start` (to stop it use `bin/instance stop`; run it in debug mode with `bin/instance fg`)
	- The service should now be running on port 8080 of that host.
	
- Note that the instructions above may not work for you once a new version of SENAITE is out 

- What helped me work through the dependency issues was looking at the [GitHub page for SENAITE Dockerfiles](https://github.com/senaite/senaite.docker); click the link for the version you want and then look at the following files:
	- `Dockerfile`: for the Plone version; look under the "ENV" environment variables section
	- `build_deps.txt` and `run_deps.txt`: for system dependencies
	- `docker-initialize.py`: for stuff you may need for proxy server configuration (see below) 	
	- `requirements.txt`: follow the link in this file to find out what versions of Python packages you will need
	
- So I now had SENAITE running on my server but my problems were not at an end: some of the functionality in the interface was not working, and there were lots of errors in the browser console, indicating that I had issues related to ["Cross-Origin Resource Sharing" (CORS)](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny); basically, when your browser has opened a Web page from a server, it will not by default allow that page to access resources from another location unless specified; this is a security measure to prevent an attack called ["Cross Site Request Forgery" (CSRF)](https://owasp.org/www-community/attacks/csrf); however with a Web app you may well need to access resources at a different location, so you need to specify this in the "headers" that the server sends to the browser
	- As a quick fix I added a "Custom Location" to Nginx Proxy Manager as suggested [here](https://www.reddit.com/r/selfhosted/comments/xo5uht/cors_issue_how_to_work_around_it_with_nginx_proxy/), containing the following:
		```
		add_header 'Access-Control-Allow-Origin' '*';
		add_header 'Content-Security-Policy' 'upgrade-insecure-requests';
		```
	
	- This would not be sufficiently secure in itself (I think this is something that would be best addressed in the Plone configuration, as for example [here](https://community.plone.org/t/volto-on-an-existing-plone-5-1-x-project/13564)), but this is just a demo version
- Having got past that, I still couldn't get the interface to work for one thing (related to dropdown boxes) and then discovered that this did work if I used (vanilla) Edge instead of Firefox (with lots of security add-ons)
- I was feeling pretty good at this point and started on the [Quick Start tutorial](https://www.senaite.com/docs/quickstart); unfortunately this is also out-of-date and will not work for you in a recent version of SENAITE
- However I have worked out that if you do things in a different order to that specified, and do one or two things that aren't documented in the Quick Start (this can be a future post), then it is all possible and it all seems to work well. 
- As (despite my usual tenacity) I never got OpenELIS fully working I am now delighted to say I can install a laboratory information management system!
