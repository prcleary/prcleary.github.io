+++
title = "Next steps with Proxmox"
+++

Been ill with some virus and feeling pretty sorry for myself for nearly two weeks.

![Our investigation into whining-based remedies became the first study to be halted by the IRB on the grounds that the treatment group was 'too annoying'.](https://imgs.xkcd.com/comics/cold_complaints_2x.png)

I should note a few teething troubles I had with my Proxmox installation:

1. Networking - first problem was that, while the Proxmox host could connect to the Internet, none of my VMs could. I didn't try containers but am sure it would have been the same.

    There are a number of different ways of setting up networking in Proxmox: basically *bridging*, *routing* and *NAT*. I will attempt to summarise what I think I know about these options.
		
	Bridging is the default for Proxmox and is probably the norm for corporate internal networks in which devices access the Internet via a "gateway" (device which connects your internal network to the Internet). With bridging, VMs access the internet via a shared virtual software interface called a Linux Bridge (usually called `vmbr0` in configuration files) which acts like a "switch" and is basically connected directly to the Internet. A switch is a network device that reads the destination addresses on packets and passes them on in the required direction, like a mail sorting office does with letters. You can have multiple bridges with different IP addresses if required.
	
   In some circumstances you might not be able to use bridging. Routing (in the Proxmox sense) is an alternative networking setup which basically adds another virtual device between the VMs and the interface with the Internet. You can still use multiple IP addresses.
		
    With NAT (network address translation; also called *masquerading*), specified *ports* on your VMs are "forwarded" to the network interface by your firewall. 
		
	Ports are just a way of representing multiple networking connections to one server. A server might have several connections running: a web service, an SSH connection and other things too. As the server only has one IP address, you need some way of specifying which bit of the server to connect to for a particular purpose, which is where ports come in. Think of ports as numbered connections to a single machine.  Certain services tend to run on ports with certain numbers: SSH typically runs on port 22 (though you can change this to slightly slow down someone trying to hack your SSH connection). Other ports are free for use and allocated when needed.
		
	NAT is where you map a port on the host to a port on a VM. You are effectively replacing the port on the host with the port on the VM.
	
	It is probably the most straightforward option if you have a server with a hosting provider and only one public IP address, and the one I went with.
	
    Having figured this out, I still couldn't make it work. I looked at a lot of different Proxmox network configurations that I found on the Web, in forums etc. Mine looked fine but for no apparent reason did not work. In the various forums there are many despairing wannabe Proxmox users and many astoundingly patient people trying to help them. I then got a clue from somewhere that something might have gone wrong during the installation and so I re-ran the installation script right from the `installimage` stage. This, plus very carefully making sure my `/etc/network/interfaces` file looked very much like the one in [this](https://gist.github.com/theprincy/71c5205a3fb704074c8d0576e95fecc9), did the trick. 
		
	Note that it seems you need to reboot the Proxmox host after any change in network configuration before concluding it has not worked.
		
    My VMs could now access the Internet and I was able to configure static IP addresses for each of them on installation (this means that the IP addresses of my VMs within Proxmox will not change, say after a reboot).
		
   I started off using the `ufw` firewall for the Proxmox host as I couldn't find much information on the Web about the Proxmox firewall. At one point I foolishly turned on the data centre level Proxmox firewall and lost access to everything, having to resort to the Hetzner rescue system (more than once), and eventually managing to disable the main firewall and regain access via a rather convoluted way. More guidance on getting out of that [here](https://forum.proxmox.com/threads/how-to-disable-pve-firewall-after-lock-out-datacenter-level-firewall.60557/).
		
	 Eventually I found some guidance [here](https://www.kiloroot.com/secure-proxmox-install-sudo-firewall-with-ipv6-and-more-how-to-configure-from-start-to-finish/) on how to configure the various Proxmox firewalls - it is not great but it was enough. 
		
    Now once I had a new service up and running on a VM, I just needed to add a firewall rule forwarding the service port to the host. 
		
   In the end I went with [Nginx Proxy Manager](https://nginxproxymanager.com/) in an LXC container with some help from [this YouTube video](https://www.youtube.com/watch?v=W18bb8ZydlM) and [this page](https://github.com/ej52/proxmox-scripts/blob/main/lxc/nginx-proxy-manager/README.md). Now I can easily point various subdomains to different services on Proxmox using HTTPS without any need to mess with the firewall.
2. Second problem I ran into was running out of space! When I was installing the first (or maybe the second) VM, the system went down entirely and refused to come back up. It turned out that the default disk configuration I had used had given me only a small root partition which soon filled up. 

   I managed to access the system via the rescue system, deleted some logs (and the Ubuntu ISO file) and managed to restart the system. I then expanded the root partition to fill all available space with the following command 
	 
	 ```lvresize -l +100%FREE --resizefs /dev/mapper/vg0-root```
3. Third problem was small console text size for VMs (haven't worked out how to use SPICE yet) but my solution is [here](dealing-with-tiny-console-text-in-proxmox.md).

I also did some additional configuration of Proxmox using [Proxmox Toolbox](https://github.com/Tontonjo/proxmox_toolbox), such as smart self-tests (couldn't get email notifications to work however).
