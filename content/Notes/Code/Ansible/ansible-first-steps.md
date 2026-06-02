---
title: Ansible first steps
tags:
  - Ansible
---

First install Ansible on master node. On Manjaro Linux you use this:

```bash
sudo pacman -Syyu ansible
```

Make sure all managed nodes can connect via SSH without password (NB may use different ports).

```bash
mkdir ~/ansible
cd ansible
ansible-config init --disabled -t all > ansible.cfg
sudo vim /etc/ansible/hosts
```

In this file (the inventory) list your nodes' IP addresses and SSH ports:

```
[ubuntu_webservers]
xx.xxx.xxx.xxx ansible_port=xxxx
xx.xxx.xxx.xx ansible_port=xxxx
xx.xxx.xxx.xxx ansible_port=xxxx
xx.xxx.xxx.xx ansible_port=xxxx
xx.xxx.xxx.xxx ansible_port=xxxx
```

Then run a test:

```bash
ansible ubuntu_webservers -m ping
```

and see something like:

```
xx.xxx.xxx.xxx | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
xx.xxx.xxx.xx | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
# etc
```

### Get info on the managed nodes.

```bash
ansible -m setup ubuntu_webservers
```

### Update software on managed nodes.

NB fails unless `sudo` password same on all managed nodes.

```bash
ansible ubuntu_webservers -m apt -a "upgrade=yes update_cache=yes cache_valid_time=86400" --become --verbose -u paul -K
```
You can also force a reboot where required (TBA).

