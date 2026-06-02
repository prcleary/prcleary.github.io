---
title: Updating an Ubuntu server
date: 2022-10-29
tags:
  - Linux
---


```bash
sudo apt update && sudo apt upgrade --yes
```

Can write a bash script to reduce typing:

```bash
echo "sudo apt update && sudo apt upgrade --yes" > update_system.sh
chmod +x update_system.sh
```

This can then be run using:

```bash
./update_system.sh
```


