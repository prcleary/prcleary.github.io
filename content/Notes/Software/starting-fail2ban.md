---
title: Starting fail2ban
date: 2022-10-28
tags:
  - Cybersecurity
---

Check it is not running first.

```bash
ps aux|grep fail2ban
```

If it has started up automatically following installation you should see something like:

```
root 1105 0.1 0.1 300736 22632 ? Ssl 06:40 0:14 /usr/bin/python3 \
/usr/bin/fail2ban-server -xf start
```

If it has not started running automatically:

```bash
sudo systemctl start fail2ban
```


