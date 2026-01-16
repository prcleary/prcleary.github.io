+++
title = "My Linux cheatsheet"
toc = true
+++

> Stuff I find myself Googling for the nth time

### Check which ports are open

```bash
ss -tulnp
nmap localhost
netstat -ntlp
```

### Delete duplicate files

```bash
fdupes -rdN dir/

# r - recursive
# d - preserver first file, delete other dupes
# N - run silently (no prompt)
```

- [How to delete duplicate files with fdupes? - Ask Ubuntu](https://askubuntu.com/questions/177346/how-to-delete-duplicate-files-with-fdupes)

### Find out where all the space on your hard disk has gone

```bash
du -sh * | sort -h
```
### Give user sudo permissions

```bash
sudo usermod -a -G sudo username
```

### Remove line from CLI history

E.g. to remove use of password

```bash
history -d 316
```

### See logged in users

```bash
w
```

- [How to see Logged in Users in Linux [4 Simple Ways]](https://linuxhandbook.com/linux-logged-in-users/)

### Shorten bash prompt temporarily

```bash
PS1='\u:\W\$ '
```

- [How can I shorten my command line (bash) prompt? - Ask Ubuntu](https://askubuntu.com/questions/145618/how-can-i-shorten-my-command-line-bash-prompt) to make this permanent

### Useful `find` commands

Find a type of file and do something to each

```bash
find /path/to/source/folder -type f -name "*.pdf" -exec cp {} /path/to/destination/folder \;
```

List all file endings

```bash
find /path/to/folder -type f | awk -F. '{if (NF>1) print $NF}' | sort -u
```

Search files for pattern

```bash
find / -type f -name "*.conf" | xargs grep "listen"
```

### `ufw` firewall

With `sudo` if not root:

```bash
ufw status
ufw status numbered  # can then use ufw delete # etc
ufw allow 22  # add rule to allow traffic for SSH
ufw delete allow 22  # delete rule
ufw deny 22  # add rule to block traffic for SSH
ufw reset  # back to default rules
ufw default deny incoming  # can set defaults
ufw default allow outgoing
ufw allow from 10.10.10.2  # specify IP
ufw enable
```

If using Teleport, leave ports 3022, 3023 and 2025 open.

### View system logs

- usually with `sudo` 

```bash
journalctl  # see all with less keyboard shortcuts
journalctl -n 100  # see last 100 entries
journalctl -xe  # last few entries with extra information 
journalctl -f  # real time view
journalctl -k  # kernel logs only
journalctl -u ssh  # specific service
journalctl --since "2020-07-10 15:10:00" --until "2020-07-12"  # specific period
journalctl -p 3 -xb  # errors only
# -p 3 : filter logs for priority 3 (which is error) - can also use: emerg, alert, crit, err, warning, notice, info, or debug
# -x : provides additional information on the log (if available)
# b : since last boot (which is the current session)
```

- [How to Use journalctl Command to Analyze Logs in Linux](https://linuxhandbook.com/journalctl-command/)
- [journalctl Command in Linux with Examples - GeeksforGeeks](https://www.geeksforgeeks.org/journalctl-command-in-linux-with-examples/)


