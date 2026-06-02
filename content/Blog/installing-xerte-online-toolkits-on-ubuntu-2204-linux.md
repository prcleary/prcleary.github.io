---
title: "Installing Xerte Online Toolkits on Ubuntu 22.04 Linux"
date: 2023-06-17
tags:
  - Xerte Online Toolkits
  - e-learning
  - Ubuntu
---

Notes from own recent installation:

- on Proxmox, created a new virtual machine running Ubuntu 22.04, with 2 cores, 2 sockets, 4096 RAM, 50 Gb storage - see also [here](https://prcleary.github.io/#Checklist%20for%20setting%20up%20a%20new%20Ubuntu%20Server%20VM%20in%20Proxmox%20to%20run%20Docker)
- ran the Ubuntu installer, configuring a static IP address and creating a non-root `sudo` user during installation
- rebooted, logged in and updated the system
- if you weren't using Proxmox, you would configure the firewall and SSH and take some additional security measures at this point, e.g. as per [here](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04)
- installed LAMP stack (a standard Web server stack of Linux, Apache web server, MySQL database and PHP, a scripting language for interactive Web pages) following some of this: [How To Install Linux, Apache, MySQL, PHP (LAMP) Stack on Ubuntu 22.04 | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-22-04) 
	- I ignored the firewall parts as I am using the Proxmox firewalls and a reverse proxy (Nginx Proxy Manager)
- installed Apache web server with `sudo apt install apache2` 
- created a subdomain on Cloudflare pointing to my Proxmox (without proxying for the moment)
- created a proxy host on Nginx Proxy Manager pointing to the VM IP address
- now I could see the Apache 2 default page on the subdomain address
- then installed MySQL with `sudo apt install mysql-server` 
	- didn't run the secure installation script (or rather tried and it didn't work) 
	- did change the root password
- then installed PHP (and extensions) with `sudo apt install php libapache2-mod-php php-mysql php-dev php-gd php-imap php-ldap php-odbc php-pear php-xml php-xmlrpc php-zip php-curl php-mbstring`
- downloaded the latest XOT from <https://www.xerte.org.uk/index.php/en/downloads-1/send/3-xerte-online-toolkits/2135-xertetoolkits-3-12> (you need to have a free account and to be logged in)
- uploaded the downloaded zip file to Google Drive
- from Google Drive got the link for sharing the file with anyone and extracted the ID
- installed Python and then [gdown · PyPI](https://pypi.org/project/gdown/) with `pip` to enable downloading of files to the VM from Google Drive 
- downloaded the XOT zip file to the VM with `/home/paul/.local/bin/gdown --id xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxx` (insert correct ID)
- created the Xerte installation folder with `sudo mkdir -p /var/www/html/xerte`
- unzipped the XOT files to the installation folder with `unzip xertetoolkits_3.4.zip -d /var/www/html/xerte/`
- set the permissions required
	- `sudo chmod 777 /var/www/html/xerte`
	- `sudo chmod 777 /var/www/html/xerte/setup`
	- `sudo chmod 777 /var/www/html/xerte/USER-FILES`
	- `sudo chmod 777 /var/www/html/xerte/error_logs`
	- `sudo chmod 777 /var/www/html/xerte/import`
	- `sudo chown -R www-data:www-data -R /var/www/html`
- restarted Apache with `sudo systemctl reload apache2.service` (and rebooted the VM for good measure)
- then navigated in a browser to `subdomain.domain/xerte/setup/` to see the XOT Installer page 
- clicked through the checks
    - ignored the warning about `upload_tmp_dir` not being set as I think it just uses the system default if not set
        - if I had wanted to change that I would have edited the appropriate config file with `sudo vim /etc/php/8.1/apache2/php.ini`
    - had provide the MySQL root password set earlier
    - created an admin XOT user
    - after getting to the "Install complete" page, deleted the setup folder etc as instructed
- navigated to `subdomain.domain/xerte/management.php` and logged in with the admin account
    - changed `Site Administration/Site/Authentication settings` to "Db"
    - checked everything was working
        - checked for Apache errors with `sudo tail -f /var/log/apache2/error.log` - just something harmless about language packs
				- checked for MySQL errors with `sudo tail -f /var/log/mysql/error.log`
- set up TLS (in my case with Nginx Proxy Manager) 
- added the following to the custom config in NPM: `location = /{return 301 $scheme://$http_host/xerte;}` - now it redirects `subdomain.domain` to `subdomain.domain/xerte`
- logged in as admin and under `Site Administration/Site/Site settings` updated the URL to https
- enabled proxying on Cloudflare
- as admin, created an ordinary user for myself under `Users`
- logged in as ordinary user and began to author e-learning materials after enabling pop-ups in the browser
- much easier than last time when I did it on CentOS 7!

