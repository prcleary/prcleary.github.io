---
id: 20241014120000
title: "My Proxmox cheatsheet"
aliases:
  - "Proxmox commands"
  - "Proxmox quick reference"
type: cheatsheet
category: tech
subcategory: proxmox
domain: homelab
tags:
  - tech/proxmox
  - tech/virtualization
  - tech/homelab
  - tech/cli
  - reference/cheatsheet
  - status/active
created: 2024-10-14
modified: 2026-05-23
date: 2024-10-14
status: active
up: "[[Homelab]]"
---

# My Proxmox cheatsheet

> [!abstract] Summary
> Operational notes for my Proxmox VE host: Let's Encrypt via Cloudflare DNS, updates, the xterm.js trick for copy/paste in VM consoles, and the most-used `pct` and `qm` subcommands. Written for future-me at 2 AM.

## Set up Let's Encrypt with Cloudflare

The HTTP-01 challenge didn't work for me (port 80 was in use by Nginx Proxy Manager), so I used DNS-01 with Cloudflare as the DNS provider.

1. Get the **zone ID** (from the Overview page of your domain in Cloudflare) and create an **API token**.
   - [Find account and zone IDs — Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)
   - [Create API token — Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) — I used the "Edit zone DNS" template with all options at defaults.
2. Follow [Let's Encrypt with Cloudflare — 3os](https://3os.org/infrastructure/proxmox/lets-encrypt-cloudflare/#instalaion-and-configuration). This worked.
3. Renewal is automatic via `pve-daily-update.service` (renews when the cert is within 30 days of expiry).

The official [Proxmox certificate management docs](https://pve.proxmox.com/wiki/Certificate_Management) are correct but less practical for this specific Cloudflare setup.

## Setting up email notifications

> [!todo] Not yet working — revisit.

## Updating Proxmox

```bash
# as root
apt update
apt dist-upgrade
apt autoremove
apt clean         # clears /var/cache/apt/archives
```

If updates fail with a disk-out-of-space error, it's often `/boot` filling up with old kernels. I've fixed this by manually removing old kernels — `apt autoremove` should usually catch them, but doesn't always.

For a more convenient updater (host + LXC + VMs in one go): [BassT23/Proxmox](https://github.com/BassT23/Proxmox).

## Use xterm.js for VM terminal (nicer, allows copy/paste)

Proxmox uses noVNC by default, which doesn't support copy/paste. Switching to xterm.js fixes this without installing anything in the VM. From [Silicon's blog](https://silicon.blog/2023/01/12/how-to-enable-copy-and-paste-function-on-your-proxmox-web-console-without-install-additional-software-in-your-vm/).

**On the host:**

```bash
qm set <vmid> -serial0 socket   # e.g. qm set 100 -serial0 socket
```

**In the VM:** edit `/etc/default/grub`, change the line to:

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet console=tty0 console=ttyS0,115200"
```

Then:

```bash
sudo update-grub
sudo reboot                      # full reboot needed, not just restart of the VM
```

Now an xterm.js console option appears for that VM. If it looks frozen, press Enter a few times.

Sometimes this stops working — repeating the steps above usually fixes it. SPICE didn't work on my corporate laptop.

## `pct` — Proxmox container toolkit

For LXC containers. `<id>` below is the container ID (e.g. `100`).

| Command | Purpose |
|---|---|
| `pct list` | List all containers |
| `pct enter <id>` | Enter the container shell (like SSH) |
| `pct status <id>` | Container status |
| `pct start \| stop \| shutdown \| destroy \| unlock <id>` | Lifecycle |
| `pct config <id>` | Show config |
| `pct exec <id> -- <cmd>` | Run a command inside the container |
| `pct snapshot <id> <name>` | Snapshot |
| `pct restore <id> <file in /mnt/backup>` | Restore from backup |
| `pct resize <id> rootfs +10G` | Grow rootfs (cannot shrink) |
| `pct push <id> <local> <remote>` | Copy file in |
| `pct pull <id> <remote> <local>` | Copy file out |
| `pct create ...` | Create a new container |

## `qm` — QEMU/KVM machine management

For VMs. `<id>` below is the VM ID.

| Command | Purpose |
|---|---|
| `qm list` | List all VMs |
| `qm status <id>` | VM status |
| `qm start \| stop \| shutdown \| reboot \| destroy <id>` | Lifecycle |
| `qm unlock <id>` | Unstick a stuck VM |
| `qm config <id>` | Show config |
| `qm set <id> <option> <value>` | Change config |
| `qm resize <id> scsi0\|virtio0\|ide0 +20G` | Grow disk (cannot shrink) |
| `qm snapshot <id> <name>` | Snapshot |
| `qm rollback <id> <name>` | Roll back to snapshot |
| `qm terminal <id>` | Serial console (needs serial set up — see xterm.js section above) |
| `qm guest exec <id> -- <cmd>` | Run a command via QEMU guest agent |
| `qm guest exec <id> -- su -c '<cmd>' <user>` | ...as a specific user |
| `qm create ...` | Create a new VM (still need to learn this properly) |

---

## LINKS

### Up
- [[Homelab]] *(to write)*

### Related
- [[Docker cheatsheet|My Docker cheatsheet]] — most of what runs on top of Proxmox here is Dockerised
- [[Nginx Proxy Manager]] *(to write)*
- [[Self-hosting]] *(to write)*
- [[Backups]] *(to write)*

### External references
- Proxmox VE wiki: <https://pve.proxmox.com/wiki/>
- Proxmox certificate management: <https://pve.proxmox.com/wiki/Certificate_Management>
- BassT23/Proxmox updater: <https://github.com/BassT23/Proxmox>
