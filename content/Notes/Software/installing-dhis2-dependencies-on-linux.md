---
title: Installing DHIS 2 dependencies on Linux
date: 2022-10-28
tags:
  - Linux
  - DHIS 2
---

```bash
sudo add-apt-repository ppa:certbot/certbot
sudo apt install certbot chkrootkit clamav debsums fail2ban git libfontconfig libjfreechart-java \
nginx openjdk-8-jre-headless:amd64 openssl postgresql-10-postgis postgresql-10-postgis-2.4 \
postgresql-contrib python-certbot-nginx rkhunter software-properties-common tmux tomcat8-user \
tripwire ufw vim aptlist-bugs apt-listchanges needrestart
```

Specific considerations re Java

