+++
title = "Notes on new homelab setup"
+++

Bullet point notes on recent acquisition of home server and set up so far:

- Aim was to consolidate my various servers and perhaps save some money
- I had a (somewhat underused) dedicated [Hetzner](https://www.hetzner.com/) auction server running mostly dispensable health information system and other experiments, plus a large VM for [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx), the super-useful tool for managing your PDFs. 
- I also had a few cloud VMs with Hetzner; the main one ran [CapRover](https://caprover.com/) as a Platform-as-a-Service for [Nextcloud](https://nextcloud.com/), my wife's blog, several other Docker containers and my various app experiments. CapRover is great and served me well for a long time, but I feel I've outgrown it a bit. The other two VMs run [Mail-in-a-Box](https://mailinabox.email./) as the mail server for a local sports club and [RustDesk](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/) to enable me to remotely fix my mum's laptop - I don't plan to touch those at the moment.
- I treated myself to a [Minisforum MS-01](https://store.minisforum.com/products/minisforum-ms-01) (Intel® Core™ i9-12900H / 32GB RAM+1TB SSD / UK) just before Xmas.
- My plan was to install [Proxmox](https://www.proxmox.com/en/) as a virtualisation environment and then deploy virtual machines/containers to provide my various online services. I use Nextcloud for tasks/notes/miscellaneous files, [Calibre-Web-Automated](https://github.com/crocodilestick/Calibre-Web-Automated) for ebooks and Paperless NGX for my large collection of PDFs. I wanted at least those services to be in separate VMs/containers for greater flexibility. I also wanted to have the flexibility of CapRover (though not necessarily CapRover) for running various services that don't really deserve their own VM/container as well as my own web apps. I also wanted the option to play with [Kubernetes](https://kubernetes.io/) a bit if possible. 
- I downloaded Proxmox 8.3.1 and flashed the OS image to a USB drive with [balenaEtcher](https://etcher.balena.io/). 
- After fiddling with the boot options on the server I installed Proxmox onto the server and configured the network (static IP address and gateway). I connected the server to the home router and then hid it, as I could do everything else via the LAN. Didn't bother with RAID or any fancy file systems, though I might come back to this.
- Ran the Proxmox Post Install script from [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=post-pve-install), copied over my SSH keys (`ssh-copy-id`) and set the locale. 
- Set up [BassT23/Proxmox: Update your Proxmox VE](https://github.com/BassT23/Proxmox) to help with updates. 
- Apart from multifactor authentication, I haven't done much else to secure the server or configure remote backups yet, but I will come back to that. I might use a separate VLAN and set up Google Drive for backups. 
- I experimented with the Nextcloud options from [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/) but eventually decided to go for [nextcloud/all-in-one: 📦 The official Nextcloud installation method. Provides easy deployment and maintenance with most features included in this one Nextcloud instance.](https://github.com/nextcloud/all-in-one). 
- I initially experimented with [Tailscale](https://tailscale.com/) for secure access, but as I needed to be able to access things from my work computer I decided it was simpler to go with [Cloudflare Tunnels](https://github.com/cloudflare/cloudflared). Not all features of Nextcloud All-In-One will work behind a Cloudflare Tunnel apparently, but I haven't had any issues with the features I need.
- I installed an [Ubuntu 24.04 VM](https://community-scripts.github.io/ProxmoxVE/scripts?id=ubuntu2404-vm) for Nextcloud, and used [this](https://github.com/community-scripts/ProxmoxVE/discussions/272) to set up Cloud-Init, resize the disk (after I had allocated it more space) and install other things including Docker and Docker Compose. 
- I initially started Nextcloud with the `docker run` command given, but then decided to use Docker Compose instead (after cleaning up images, containers, volumes etc first), using this from [(Solved)AIO working with Cloudflare? · nextcloud/all-in-one · Discussion #2845](https://github.com/nextcloud/all-in-one/discussions/2845#discussioncomment-6423237): 

	```
	version: "3.8"

	services:
		nextcloud:
			image: nextcloud/all-in-one:latest
			restart: always
			container_name: nextcloud-aio-mastercontainer 
			volumes:
				- nextcloud_aio_mastercontainer:/mnt/docker-aio-config 
				- /var/run/docker.sock:/var/run/docker.sock:ro 
			ports:
				- 80:80 
				- 8080:8080
			environment: 
				- APACHE_PORT=11000 
				- APACHE_IP_BINDING=0.0.0.0
				- SKIP_DOMAIN_VALIDATION=true

	volumes:
		nextcloud_aio_mastercontainer:
			name: nextcloud_aio_mastercontainer
	```
- After `docker compose up -d`, it soon shows a `/setup` page where you get a passphrase to log in to the system. After that you go to a `/containers` page where you can select which additional options you want (I chose most of them).
- Then you wait while it sets up. It then gives you an initial admin password which you should change. Nextcloud was then accessible on my local network. 
- I configured my profile and set up email via the football club mailserver. I then installed all the Nextcloud apps I have used previously, plus some exciting new ones. I even got Nextcloud Office to work! However the Tables app still seems a bit flaky. I used the "OCCWeb" app to run commands like `maintenance:repair` to check/fix things. I also tweaked the config file for my phone region - I still have no idea why this can't be done in the GUI.
- I logged into Cloudflare and created a tunnel - it is ridiculously easy. Name your tunnel, copy the code provided into the VM console, specify the port and you're done. I could now access my Nextcloud login page on the public Internet. 
- I use the [nextcloud/desktop: 💻 Desktop sync client for Nextcloud](https://github.com/nextcloud/desktop) to synchronise files to my desktop machine, so I paused that, removed the connection and then connected it to the new Nextcloud instance. 
- I use [Tasks.org](https://tasks.org/) Android mobile app to synchronise my tasks with Nextcloud. On the mobile app, I moved all my tasks into local lists, connected it to the new Nextcloud instance and then moved my tasks back into their original lists. 
- I also use Nextcloud as backup/sync location for various mobile apps such as [Moon+ Reader for Android](https://www.moondownload.com/) ebook reader (which I use a lot) and [XilinJia/Podcini: Open source podcast instrument for Android supporting contents from YouTube and YT Music as well as normal podcasts.](https://github.com/XilinJia/Podcini), so reconfigured those. 
- Next I installed an Ubuntu 24.04 VM (from a template) and installed [Ghost: The best open source blog & newsletter platform](https://ghost.org/) from scratch for my wife's blog, which has only one post so I just copied and pasted it over. 
- I backed up all my VMs/containers on my old Proxmox and `scp`'d them to the new server, which took ages. Restoring them taught me a few things. 
- Firstly, I think I only had storage called `local` on my old Proxmox, whereas my new one has both `local` and `local-lvm`. I should have restored things to the flexible storage `local-lvm` not the root file system `local`, as `local` soon filled up. Proxmox did tried to warn me but I changed the settings of `local` to allow container directories. But once I realised what I was doing I backed them up and restored them in the right location. 
  - Restoring VMs: e.g. `qmrestore /var/lib/vz/dump/vzdump-qemu-100-2025_02_16-13_59_09.vma.zst 100 --storage local-lvm`
  - Restoring LXC containers: e.g. `pct restore 103 /var/lib/vz/dump/vzdump-lxc-104-2025_02_16-13_55_14.tar.zst --storage local-lvm`
- Secondly you have to reconfigure network settings for each VM/container. For LXC containers this is done on the host (any changes to `/etc/network/interfaces` in the container will be overwritten at reboot), e.g. `vim /etc/pve/lxc/103.conf`. For Ubuntu VMs you configure network settings in the VM with e.g. `sudo vim /etc/netplan/00-installer-config.yaml`. Restart after any changes. 
- I was able to restore all of my backups on the new server. 
- After restoring my Paperless NGX LXC, I added the new public URL to the config file and created a Cloudflare Tunnel. I also reconfigured the mobile app and set up integration with Nextcloud - now I can send files from my phone camera or from Nextcloud. 
- For my ebooks I then set up a Docker VM with [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=docker-vm). I increased the disk size and then grew the file system in the VM using `growpart` and `resize2fs`. I created the folders required for volumes, amended the Docker Compose script for Calibre Web Automated, `docker compose up -d`'d it up, `scp`'d my ebooks into the ingest folder, checked the settings and made it accessible with a Cloudflare Tunnel.
- I cancelled the Hetzner server as I had no further need for it. I still have a few things running behind CapRover but I will get to those soon.
- I then set up an LXC container with [Vikunja: The open-source, self-hostable to-do app](https://vikunja.io/) as it's something I've been interested in playing with for task management. I'm not convinced it is worth moving from Nextcloud Tasks at this point.
- CapRover isn't intended to be run behind a Cloudflare Tunnel, though I think you can do it. So I decided to try out [CasaOS - A simple, easy-to-use, elegant open-source personal cloud system](https://casaos.io/) to give me at least some of the flexibility of CapRover for trying out apps or arbitrary Docker containers. There is a handy script to automate most installation (as an LXC) here: [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=casaos). CasaOS looks very nice and has a small but useful app store. I've set up the Cloudflared app as per here: [How to use Cloudflare Tunnel in CasaOS? - CasaOS / CasaOS - Tutorials - IceWhale Community Forum](https://community.zimaspace.com/t/how-to-use-cloudflare-tunnel-in-casaos/131). This is where I am up to, installing various apps and seeing what I can do with this.

