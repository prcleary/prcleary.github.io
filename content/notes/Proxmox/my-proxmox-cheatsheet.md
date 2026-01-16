+++
title = "My Proxmox cheatsheet"
+++

### Set up Let's Encrypt with Cloudflare

- as HTTP method didn't work (port 80 probably in use by Nginx Proxy Manager), let Cloudflare manage DNS
	- get zone ID (Overview page) and API token 
		- [Find zone and account IDs · Cloudflare Fundamentals docs](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/)
		- [Create API token · Cloudflare Fundamentals docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) - I left all the options at the defaults
	- this then worked: [Let's Encrypt with Cloudflare - 3os](https://3os.org/infrastructure/proxmox/lets-encrypt-cloudflare/#instalaion-and-configuration)
	- it should update itself automatically now
	- less helpful instructions here: [Certificate Management - Proxmox VE](https://pve.proxmox.com/wiki/Certificate_Management)

### Setting up email notifications

*Not got this working yet*

### Updating Proxmox

```bash
# as root
apt clean
apt update
apt dist-upgrade
apt autoremove
```

If updates fail with a disk-out-of-space error, then it could be that `/boot` is full of old kernels and suchlike. This has happened to me already - I solved it simply by deleting some old kernels.

This is the more convenient way: [BassT23/Proxmox: Update your Proxmox VE](https://github.com/BassT23/Proxmox)

### Use `xterm.js` for VM terminal (nicer and allows copy and paste) 

From [here](https://silicon.blog/2023/01/12/how-to-enable-copy-and-paste-function-on-your-proxmox-web-console-without-install-additional-software-in-your-vm/#:~:text=Proxmox%20uses%20noVNC%20by%20default,such%20as%20TeamViewer%20or%20Anydesk)

In host console:

```bash
qm set your_vm_id -serial0 socket
# where your_vm_id is e.g. 100
```

In VM console:

```bash
sudo vim /etc/default/grub
```

and change line to:

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet console=tty0 console=ttyS0,115200"	
```

Then update GRUB and reboot:

```bash
sudo update-grub
sudo reboot
```

Now you can select an xterm.js console for that VM. Press Enter a few times if it seems to get stuck.

Sometimes this stops working, but repeating the steps above usually gets it working again.

Couldn't get SPICE to work, at least on my corporate laptop

### Useful `pct` (Proxmox container toolkit) commands

```bash
pct list
pct enter 100  # like SSH
pct status|start|stop|shutdown|destroy|unlock 100
pct config 100
pct exec 100 apt update
pct snapshot 100 snapshotname
pct restore 100 <file in /mnt/backup>
pct resize 100 rootfs +10G
pct push 100 localfilepath containerfilepath
pct pull 100 containerfilepath localfilepath
pct create ...
```

### Useful `qm` (QEMU Machine) commands

```bash
qm guest exec 100 -- df -h  # if `qm-guest-agent` installed on VM
qm guest exec 100 -- su -c 'ls /home/senaite/senaitelims' senaite  # as specific user
qm terminal 100  # needs serial interface
qm status|start|stop|shutdown|destroy|reboot 100
qm resize 100 scsi0|virtio0|ide0 50G|+20G  # can only increase
qm list
qm create  ... # must learn more about this one
qm config 100 # list config
qm set 100 ... ...  # change config
qm snapshot 100 snapshotname
qm rollback 100 snapshotname
qm unlock 100  # if stuck
```


