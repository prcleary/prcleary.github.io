+++
title = "Proxmox: your own data centre"
+++

I want to do more experimentation with virtualisation and containerisation, but don't want to keep paying additional sums for things I might spin up on cloud providers like Hetzner or Digital Ocean. I've got several web apps/services that I use regularly (Nextcloud, Calibre, RStudio, Jupyter, Miniflux, Dolibarr, Appsmith and others) running on my domain, all of which run in Docker containers on a single VM behind CapRover (which uses Docker Swarm). Although only a single point of failure away from data loss (I've seen similar setups described as "clown computing"), this has worked really well for my personal stuff so far. I take snapshots, though not perhaps as frequently as I should, and periodically back up my Nextcloud files and other key stuff to an external drive (Nextcloud syncs with my main home Linux box). So not quite a 3-2-1 backup strategy. I've also got a mailserver running on a separate (much lower spec) VM for a local football club I do some admin stuff for (use MailInABox for this and had to interact with Google, Microsoft and others to get the IP address off various spam blacklists). I've also temporarily set up various other more expensive VPSs to experiment with things like DHIS 2 over the years.

I read a lot about tools like Vagrant, Terraform, Ansible, Kubernetes and similar things which have the potential to automate the process of spinning up containers or virtual machines, installing and configuring software and thereafter doing the maintenance and monitoring. I've used Ansible in a small way (I can now update my existing VMs with a single command), and managed to get Vagrant working with VirtualBox on my work laptop once. I even did a CloudFoundry course once and managed to use that to deploy a Shiny app. So lots of tinkering so far. 

I work with colleagues abroad who have access to a data centre and realise that if I am to make any significant contribution to establishing a sustainable information system architecture based on open source software I need access to something similar without bankrupting myself (I regard this as a hobby that massively informs and helps my work, so costs are on me). There are various "free tiers" on things like Amazon Web Services that you can play on, but I have read horror stories of people being faced with bills of tens of thousands of dollars for accidental usage. I have a free tier account on AWS but have been a bit too scared to play with it using things like Terraform or Kubernetes for that reason.

Which is where Proxmox comes in: [Proxmox - Powerful open-source server solutions](https://www.proxmox.com/en/). According to the website:

> Proxmox VE is a complete open-source platform for enterprise virtualization. With the built-in web interface you can easily manage VMs and containers, software-defined storage and networking, high-availability clustering, and multiple out-of-the-box tools on a single solution.

This is an open source product from a commercial company; the product is available for free, but they make their money from support contracts, training and the like. This makes it very popular among self-hosting/home server folk, particularly those who are actually running their own physical servers at home. I had wondered if I could recycle any of a few old bits of kit (mainly past-it laptops) I have lying round at home into a home server setup, but there are reasons why we stopped using them (either they are very slow or there is something wrong with them) so that has never really appealed.

I've been interested in using Proxmox for years but the simplicity and convenience of CapRover (plus not having my own physical server, plus the fact that Proxmox users seem to be technically a cut above us simpler CapRover-using souls) stopped me using it - until now...

Last night at around midnight I splurged a little (I am worth it) on renting a dedicated server from Hetzner. This means there is now a physical server in Helsinki with my name on it for my exclusive use. Hetzner run an "auction" (it doesn't really seem like an auction) where you can rent older kit at bargain prices. LowEndBox is good for finding deals like this: [LowEndBox - Cheap VPS, Dedicated Servers and Hosting Deals](https://lowendbox.com/). I wasn't expecting a quick response from Hetzner but in no time they gave me access and of course I had to then spend half the remaining night setting it up. My lovely server has 64GB of RAM, a multicore i7 CPU and (after taking account of the RAID mirroring I set up) about 500GB of storage.

For the installation of Proxmox I used bits and pieces of information from several sources, which I will link to below. Most tutorials tell you to install Debian then install Proxmox on top of that, but Hetzner have an unofficial image you can use which comes with an "installimage" script that basically installs Proxmox for you, once you have specified a domain name and how you want your storage to be organised. I created a subdomain on my main domain with an A record pointing at the server IP address. (I originally bought my domain name from GoDaddy but now use CloudFlare as my name servers. Cloudflare proxying doesn't work out of the box with Proxmox but I can come back to that later.)

The following links were useful:

- [proxmox-hetzner-autoconfigure/INSTALLING-PROXMOX.md at master · johnknott/proxmox-hetzner-autoconfigure · GitHub](https://github.com/johnknott/proxmox-hetzner-autoconfigure/blob/master/INSTALLING-PROXMOX.md) - this was the one I was reading when it finally clicked for me how you did it - I followed the same storage setup - gave a useful tip about what to do when you lose SSH access (as happened to me) - it has a follow-on section on configuration and provides a Python script to automate this though this didn't work for me.
- [Hetzner Dedicated with Debian 10 and Proxmox 6 (LXC) + Docker-CE + Portainer [NAT] · GitHub](https://gist.github.com/theprincy/71c5205a3fb704074c8d0576e95fecc9) - this gist was really helpful for some of the later stages: setting up HTTPS with Let's Encrypt, installing and setting up Docker and Portainer, setting up fail2ban and the firewall.

You end up with a system that you can access via SSH as root. You can also access the Web interface on port 8006, logging in with your root password. This seems very insecure and goes against the grain for me, but I suppose Proxmox is designed for the data centre and not the public Internet. So I have some more work to make this more secure, with SSH keys and a VPN for access.

Initial impressions are good. One minor annoyance is that you keep getting messages saying that you shouldn't really use the free version for anything serious. I found a trick (sadly can't find the page now) for removing this message fairly easily however. Edit: found it - [First steps with Proxmox VE - Danatec Blog](https://www.danatec.org/2021/05/28/first-steps-with-proxmox-ve/)

I have uploaded an Ubuntu 22.04 ISO image which I can now build virtual machines with. I also want to upload an OVA image of OpenELIS, which is not in the right format for Proxmox but can still be used - see links below:

- [Import OVA as Proxmox VM | It's full of stars!](https://www.itsfullofstars.de/2019/07/import-ova-as-proxmox-vm/)
- [Install .ova Image on Proxmox](https://ryanburnette.com/blog/proxmox-import-ova/)
- [How to Import OVA to Proxmox » SYNCBRICKS - Information Technology for everyone](https://syncbricks.com/how-to-import-ova-to-proxmox/)

So I now effectively have my own data centre. Next is to work out how I can use it for automatically provisioning and setting up VMs using Terraform and Ansible, and hopefully also play with Kubernetes clusters (for which I intend to look at [kind](https://kind.sigs.k8s.io/)). Ultimately if all goes well I can start to consolidate my various services with this.

Edit: have now added two-factor authentication, though more to do
