+++
title = "Checklist for setting up a new Ubuntu Server VM in Proxmox to run Docker" 
+++

Bit of an aide-memoire as I have done this so many times now and keep forgetting bits. 
There may be slight differences between Ubuntu versions.

1. Run the installer: specify options for keyboard, user account etc; set
static IP (I am using subnet 10.10.10.0/24, address 10.10.10.?, gateway
10.10.10.1, nameserver 8.8.8.8, search 1.1.1.1 in my setup); don't install any snaps
1. Reboot and log in
1. Update the system
1. [Address any console font issues](dealing-with-tiny-console-text-in-proxmox.md)
1. Install Docker, Docker Compose (not via apt) and dependencies - varies by
Ubuntu version so Google latest 
1. Check Docker running: `sudo systemctl status docker.service`
1. Set to start on boot: `sudo systemctl enable docker.service`
1. Add user to docker group (see [Docker cheatsheet](Docker/my-docker-cheatsheet.md)); log out and back in; no need to use `sudo docker`
any more (just `docker`)
1. Limit log size of Docker containers (see [Docker cheatsheet](Docker/my-docker-cheatsheet.md))
1. Clone any Git repos (e.g. for Docker Compose files)
1. Run Docker Compose file/startup script in repo folder
1. Create subdomain/s required (I am using CloudFlare as name servers)
1. Configure Nginx Proxy Manager to point to subdomain/s and ports (do usual other security stuff if not behind a proxy)
1. Monitor uptime and logs: if the services keep going down it might be because because you have given the VM too little RAM etc (suggest minimum of 8Gb for Docker Compose projects, ideally 16Gb), or the Docker logs are filling up all the disk space (but you can prevent that happening). I use [UptimeRobot: Free Website Monitoring Service](https://uptimerobot.com/) for monitoring uptime.
1. Play with your new Web services

Doing this manually thus far but some of it could be scripted, or could use [`cloud-init`](https://austinsnerdythings.com/2023/01/10/proxmox-ubuntu-22-04-jammy-lts-cloud-image-script/).

Here are a couple of examples I have used so far:

- [Ozone HIS](https://github.com/ozone-his/ozone-docker)

	I had to fork the Ozone HIS repo to change the Java config (as Java was running out of memory), to use the latest Superset image to address [this issue](https://github.com/amancevice/docker-superset/issues/51), and to change the OpenMRS reference app to the "latest" tag to (only partly successfully so far) deal with an issue stopping me adding patients. See [here](https://github.com/prcleary/ozone-docker) for my fork. Also realised that SENAITE was filling all the disk space because [the Zope database needs regular "packing"](https://docs.plone.org/manage/deploying/packing.html) (i.e. reclaiming space from deleted objects) which you can configure when you build the app - or do it manually in the Web GUI at the **base-url/@@maintenance-controlpanel** URL as I have been doing it with the demo Docker container.

- [Bahmni](https://github.com/Bahmni/bahmni-docker)

	If you run Bahmni behind Nginx Proxy Manager, make sure to point it to **https://vm-ip-address:443** as the connection to the Bahmni proxy also uses HTTPS - I wasted a lot of time getting "too many redirects" and other browser errors.

This approach is good for demo versions of Web platforms, but can be a bit rough around the edges requiring some firefighting on your part.
