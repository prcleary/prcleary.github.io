---
title: "Setting up Let's Encrypt with Nginx"
date: 2022-10-29
tags:
  - Nginx
  - Snippet
---

Generate Diffie-Hellman parameters:

```bash
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

Then uncomment `ssl_dhparam /etc/ssl/certs/dhparam.pem` in nginx configuration.

```bash
# sudo certbot certonly --dry-run
sudo certbot-auto --nginx -d DOMAINNAMEHERE
```

