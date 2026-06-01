---
id: 20230612120000
title: "My Linux cheatsheet"
aliases:
  - "Linux cheatsheet"
  - "Linux command reference"
type: cheatsheet
category: tech
subcategory: linux
domain: tools
tags:
  - Linux
  - CLI
  - Cheatsheet
created: 2023-06-12
modified: 2026-05-23
date: 2023-06-12
status: active
up: "[[Linux]]"
---

# My Linux cheatsheet

> [!quote] 
> Stuff I find myself Googling for the *n*th time.

> [!note] Distro assumptions
> Most commands here are distro-agnostic, but a few assume Debian/Ubuntu (e.g. the `sudo` group is named `sudo`, not `wheel`; `ufw` is the firewall front-end). Notes flag these where relevant.

## Networking & ports

### Check which ports are open

```bash
ss -tulnp          # modern, preferred
nmap localhost     # external view
netstat -ntlp      # legacy, deprecated on most distros
```

> [!tip] `ss` over `netstat`
> `netstat` is part of `net-tools`, which is unmaintained and not installed by default on most modern distros. `ss` (from `iproute2`) is faster, ships everywhere, and uses similar flags.

### `ufw` firewall

Use with `sudo` if not root. Debian/Ubuntu only — RHEL-family uses `firewalld`.

```bash
ufw status
ufw status numbered          # then ufw delete <number>
ufw allow 22                 # allow SSH
ufw delete allow 22          # remove rule
ufw deny 22                  # block SSH
ufw reset                    # back to defaults
ufw default deny incoming    # set default policies
ufw default allow outgoing
ufw allow from 10.10.10.2    # allow specific IP
ufw enable
```

> [!info] Teleport ports
> If running [[Teleport]] *(to write)*, leave ports `3022`, `3023`, and `3025` open.

## Files & disk

### Find out where all the space has gone

```bash
du -sh * | sort -h           # current dir, visible files only
du -sh .[!.]* * | sort -h    # include hidden files/dirs
ncdu                         # interactive TUI alternative — recommended
```

`ncdu` is much nicer for exploration; install via `apt install ncdu` or equivalent.

### Delete duplicate files

```bash
fdupes -rdN dir/
# r - recursive
# d - preserve first file, delete other dupes
# N - run silently (no prompt)
```

> [!warning] Test first
> `-N` skips confirmation. Run without `-d` first to *list* duplicates, then add `-d` once you're confident.

- [How to delete duplicate files with fdupes? — Ask Ubuntu](https://askubuntu.com/questions/177346/how-to-delete-duplicate-files-with-fdupes)

### Useful `find` commands

Copy all PDFs to one place:

```bash
find /path/to/source -type f -name "*.pdf" -exec cp {} /path/to/dest \;
```

List all unique file extensions in a tree:

```bash
find /path/to/folder -type f | awk -F. '{if (NF>1) print $NF}' | sort -u
```

Search inside files matching a name pattern:

```bash
find / -type f -name "*.conf" | xargs grep "listen"
# Better with whitespace-safe filenames:
find / -type f -name "*.conf" -print0 | xargs -0 grep "listen"
```

## Users & permissions

### Give a user sudo permissions

```bash
# Debian / Ubuntu
sudo usermod -a -G sudo username

# RHEL / CentOS / Fedora / Rocky / Alma
sudo usermod -a -G wheel username
```

The user must log out and back in for the group change to take effect.

### See logged in users

```bash
w                # users + what they're doing + load avg
who              # users + login time + IP
users            # just usernames, useful for scripts
last             # login history since last reboot, including logged-out users
```

The `w` output columns: `TTY` shows the terminal (`pts/N` = pseudo-terminal, typically SSH); `JCPU` is CPU time for all processes on that TTY; `PCPU` is CPU time for the current foreground process.

- [How to see Logged in Users in Linux](https://linuxhandbook.com/linux-logged-in-users/)

## Shell & history

### Remove a line from CLI history

E.g. to remove an accidentally typed password:

```bash
history             # find the line number, e.g. 316
history -d 316      # delete that line from current session
history -w          # write changes to ~/.bash_history
```

> [!warning] Both steps matter
> `history -d` only affects the current session's in-memory history. Without `history -w`, the line will reappear when you start a new shell. For a clean wipe of all history: `history -c && history -w`.

### Shorten bash prompt temporarily

```bash
PS1='\u:\W\$ '
```

- [How to shorten the bash prompt — Ask Ubuntu](https://askubuntu.com/questions/145618/how-can-i-shorten-my-command-line-bash-prompt) — to make permanent, add to `~/.bashrc`.

## System logs (`journalctl`)

Usually requires `sudo` for full access (regular users only see their own messages unless in the `adm` or `systemd-journal` group).

```bash
journalctl                          # all logs, paged with less
journalctl -n 100                   # last 100 entries
journalctl -r                       # reverse order (newest first)
journalctl -f                       # real-time follow (Ctrl+C to exit)
journalctl -xe                      # last entries + extra context (great for debugging)
journalctl -k                       # kernel messages only
journalctl -u ssh                   # specific systemd service
journalctl -b                       # current boot
journalctl -b -1                    # previous boot (-2 for two boots ago, etc.)
journalctl --list-boots             # list all available boot sessions
journalctl --since "2020-07-10 15:10:00" --until "2020-07-12"
journalctl --since yesterday        # natural language works too
journalctl -p 3 -xb                 # errors only, this boot, with context
journalctl --disk-usage             # how much space the journal is taking
```

Priority levels for `-p`: `emerg` (0), `alert` (1), `crit` (2), `err` (3), `warning` (4), `notice` (5), `info` (6), `debug` (7). Can use a range, e.g. `-p 4..6`.

`-xe` flags broken down:
- `-e`: jump to end of logs
- `-x`: include extra explanatory text (subject, support URLs, job IDs)

> [!tip] Combining filters
> Filters compose. To see only SSH errors since yesterday in UTC:
> ```bash
> sudo journalctl -u ssh -p err --since=yesterday --utc
> ```

- [How to Use journalctl Command to Analyze Logs in Linux](https://linuxhandbook.com/journalctl-command/)
- [journalctl Command in Linux — GeeksforGeeks](https://www.geeksforgeeks.org/linux-unix/journalctl-command-in-linux-with-examples/)

---

## LINKS

### Up
- [[Linux]] *(to write)*

### Related
- [[Bash scripting cheatsheet]] *(to write)*
- [[SSH cheatsheet]] *(to write)*
- [[Setting up a new Linux server]] *(to write)*
- [[Proxmox cheatsheet]] — overlap on `journalctl`, `ufw`, user management
- [[Docker cheatsheet]] — different tool, similar "stuff I keep Googling" energy
