---
title: Installing OpenELIS laboratory information management system on Ubuntu
date: 2023-08-24
tags:
  - OpenELIS
  - LIMS
  - Ubuntu
---

Notes from my own recent installation:

- Following instructions [here](http://docs.openelisci.org/en/latest/install/) which are not bad but a bit confusing on first reading
- Log in e.g. via SSH - also have sudo user with password, UK keyboard
- If you are doing this on your own virtual machine, make sure to secure SSH - in this case I was doing it via [Teleport](https://goteleport.com/)
- Check the basic system information
```bash
uname -a
```
```
Linux openelis 5.15.0-78-generic #85-Ubuntu SMP Fri Jul 7 15:25:09 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
```
```bash
free
```
```
               total        used        free      shared  buff/cache   available
Mem:         6012808      393804     5184200        1184      434804     5381872
Swap:        4194300           0     4194300
```
- Check network connectivity
```bash
ping www.google.com -w 10
```
```
PING www.google.com (142.250.181.4) 56(84) bytes of data.
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=1 ttl=111 time=43.3 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=2 ttl=111 time=44.4 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=3 ttl=111 time=45.6 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=4 ttl=111 time=43.8 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=5 ttl=111 time=44.1 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=6 ttl=111 time=44.2 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=7 ttl=111 time=44.2 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=8 ttl=111 time=43.5 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=9 ttl=111 time=44.8 ms
64 bytes from fjr04s05-in-f4.1e100.net (142.250.181.4): icmp_seq=10 ttl=111 time=43.8 ms

--- www.google.com ping statistics ---
10 packets transmitted, 10 received, 0% packet loss, time 9015ms
rtt min/avg/max/mdev = 43.337/44.168/45.649/0.636 ms
```
- Other useful commands to explore the VM resources and configuration include: `lscpu`, `lsblk`, `snap list`, `sudo fdisk -l`
- Update the system
```bash
sudo su  # gain root privileges
apt update  # update the package database
apt upgrade  # apply upgrades
apt autoremove  # remove stuff not needed
reboot
```
- Log back in after waiting a minute
- Name the system "openelis"
```bash
sudo su
hostname  # get existing host name
hostnamectl set-hostname openelis
```
- Create "openelis" user with sudo permissions
```bash
adduser openelis  # enter new password for this user, twice
usermod -aG sudo openelis
```
- Log out
- Oops! I could no longer access the renamed system until I was given permission again
- Log back in as original user and switch to new openelis user (and you probably need to do this each time you log in if you are using Teleport)
- Install dependencies
```bash
su - openelis
# NB now you are "openelis" user - use openelis user sudo password not original one
sudo apt install net-tools python3 git software-properties-common apt-transport-https ca-certificates lsb-release default-jre
```
- Install Docker (thank God for copy-and-paste)
```bash
# Get Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg  # no output
# Add apt repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null  # no output
sudo apt update
sudo apt install docker-ce
systemctl status docker
# Allow current user (openelis) to run Docker
sudo usermod -aG docker $USER
```
- Log out and back in
- Check Docker installed and running
```bash
docker version
docker ps
```
- Install Docker Compose (update version to latest - check here: <https://github.com/docker/compose/releases>)
```bash
# Takes a while
sudo curl -L https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose  # to make executable
# Check
docker compose version
```
- The next part is a little confusing in the instructions, but basically you are setting up various things for Java security, such as certificates, a key store and a trust store.
- Create a self-signed certificate (you can alternatively use your own key and certificate for production instances)
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/apache-selfsigned.key -out /etc/ssl/certs/apache-selfsigned.crt
```
- You will be asked various questions (e.g. country code, country name, institution name) which you can enter what you like for.
- When you are asked for your "fully qualified domain name", or FQDN, use what is called a "wildcard" for the domain you will be running this service on - for example if I was going to run this on a subdomain of `ukhsa.gov.uk` I would give `*.ukhsa.gov.uk` as the FQDN
- Create the keystore (you will be asked to give a password, which you should retain a record of)
```bash
sudo mkdir /etc/openelis-global/
sudo openssl pkcs12 -inkey /etc/ssl/private/apache-selfsigned.key -in /etc/ssl/certs/apache-selfsigned.crt -export -out /etc/openelis-global/keystore
sudo cp /etc/openelis-global/keystore /etc/openelis-global/client_facing_keystore
```
- Create the truststore (answer "yes" to trusting the certificate type and give another password, again to be retained)
```bash
sudo keytool -import -alias oeCert -file /etc/ssl/certs/apache-selfsigned.crt -storetype pkcs12 -keystore /etc/openelis-global/truststore
```
- Check the permissions are all correct
```bash
sudo chmod 644 /etc/openelis-global/keystore /etc/openelis-global/truststore /etc/openelis-global/client_facing_keystore
```
- At this point you can configure OpenELIS in the `/var/lib/openelisglobal/secrets/extra.properties` file:
	- Set the site identification number for this instance
	- Set the time zone for OpenELIS Application
	- Enter in the keystore password
	- Same with the truststore
	- Enter an encryption key
- Now we want to clone the OpenELIS Git repo:
```bash
# May take a while
git clone https://github.com/I-TECH-UW/OpenELIS-Global-2.git
cd OpenELIS-Global-2/
```
- Run Docker Compose to start the container
```bash
docker-compose up -d
```
- If you get an "error response from daemon" or "timeout" error as I did then simply try running the docker-compose command again, possibly more than once
- Is it working? (yes)
```bash
docker ps
```
```
CONTAINER ID   IMAGE                                         COMMAND                  CREATED         STATUS                          PORTS                                                                                  NAMES
5cdca2744ef1   ghcr.io/i-tech-uw/openelis-global-2:develop   "/docker-entrypoint.…"   3 minutes ago   Up 3 minutes                    0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 0.0.0.0:8443->8443/tcp, :::8443->8443/tcp   openelisglobal-webapp
6a4ce24107ab   hapiproject/hapi:v5.5.1                       "catalina.sh run"        3 minutes ago   Up 3 minutes                    0.0.0.0:8081->8080/tcp, :::8081->8080/tcp, 0.0.0.0:8444->8443/tcp, :::8444->8443/tcp   external-fhir-api
ad21304df107   postgres:9.5                                  "docker-entrypoint.s…"   3 minutes ago   Up 3 minutes (healthy)          0.0.0.0:15432->5432/tcp, :::15432->5432/tcp                                            openelisglobal-database
f8fd0f90f641   ghcr.io/i-tech-uw/certgen:main                "bash"                   3 minutes ago   Restarting (0) 15 seconds ago
```
- You can do other things now to check, e.g. see if services are running on ports
```bash
netstat -tln
```
- Next thing to do is change the admin password (this didn't work for me via the GUI so I needed to shell into the Docker container and change it in the database)
- You will also need to configure backups: see [here](http://docs.openelisci.org/en/latest/backups/) and change the organisation name (done via the GUI)
- You have now installed OpenELIS - now the real work to configure the system for its current purposes can begin...

