---
title: My 2018 notes on installation of DHIS 2
date: 2022-10-28
tags:
  - DHIS 2
---


**Note that the instructions below are now out of date**

- for example, you would need to use OpenJDK now

See [Installing DHIS 2 dependencies on Linux](#Installing%20DHIS%202%20dependencies%20on%20Linux) for dependencies

The following code was run by an ordinary user with sudo privileges to install DHIS 2 (version 2.28) on Ubuntu 17.10.

Information was taken from:

- <https://docs.dhis2.org/master/en/implementer/html/install_server_setup.html> (check the commands carefully as there are occasional errors)
- <http://dhis2bd.blogspot.com/2017/03/dhis2-installation-in-ubuntu.html>

First create a user called dhis.

```bash
sudo useradd -d /home/dhis -m dhis -s /bin/false
```

Set a password for user dhis.

```bash
sudo passwd dhis
```

Create a config folder for the dhis user.

```bash
sudo su
mkdir /home/dhis/config
chown dhis:dhis /home/dhis/config
exit
```

You can set the time zone with:

```bash
sudo dpkg-reconfigure tzdata
```

Set the locale e.g.

```bash
sudo locale-gen en_PK
sudo locale-gen en_PK.UTF-8
sudo update-locale
```

Install Postgres and required extensions (note that there may be later versions available on your system).

```bash
sudo apt-get install postgresql-9.5 postgresql-contrib-9.5 postgresql-9.5-postgis-2.2
```

Create the database user dhis and set a password (remember this password as you will need it).

```bash
sudo -u postgres createuser -SDRP dhis
```

Create the database dhis2.

```bash
sudo -u postgres createdb -O dhis dhis2
```

Create the PostGIS extension.

```bash
sudo -u postgres psql -c "create extension postgis;" dhis2
```

Edit a configuration file for Postgres (will have different name for later versions of Postgres). I use the Vim text editor - substitute another text editor if required.

```bash
sudo vim /etc/postgresql/9.5/main/postgresql.conf
```

The lines I uncommented are shown below.

```
max_connections = 200
shared_buffers = 3200MB
work_mem = 20MB [uncommented]
maintenance_work_mem = 512MB [uncommented]
effective_cache_size = 8000MB [uncommented]
checkpoint_completion_target = 0.8 [uncommented]
synchronous_commit = off [uncommented]
wal_writer_delay = 10000ms [uncommented]
```

Save and close the file.

At this point you should also do database performance tuning, which I did not do but which would be required for a production instance. I also didn’t set up database encryption but this would also be required.

Restart the database for the new configuration to take effect.

```bash
sudo /etc/init.d/postgresql restart
```

Configure DHIS 2 with the database settings.

```bash
sudo -u dhis vim /home/dhis/config/dhis.conf
```

Make the following changes at the appropriate points in that file.

```
connection.username = dhis
connection.password = [whatever password you chose for user dhis on the database dhis2]
encryption.password = [a strong password]
```

Save and close the file.

Change the permissions on the DHIS 2 configuration file.

```bash
sudo chmod 0600 /home/dhis/config/dhis.conf
```

Install Java (this is how I did it but there are other ways).

```bash
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
```

Accept the terms of use for Java.

Install Tomcat server.

```bash
sudo apt-get install tomcat7-user
```

Create a Tomcat instance.

```bash
cd /home/dhis/
sudo tomcat7-instance-create tomcat-dhis
sudo chown -R dhis:dhis tomcat-dhis/
```

Configure Tomcat server.

```bash
sudo vim /home/dhis/tomcat-dhis/bin/setenv.sh
```

Set Java options in this file for RAM usage for your machine.

```
export JAVA_HOME='/usr/lib/jvm/java-8-oracle/'
export JAVA_OPTS='-Xmx7500m -Xms4000m'
export DHIS2_HOME='/home/dhis/config'
```

Change to webapps directory, download DHIS 2 WAR file and change permissions and name

```bash
wget https://www.dhis2.org/download/releases/2.28/dhis.war
sudo chown -R dhis:dhis dhis.war
sudo mv dhis.war ROOT.war
```

Modify the startup script.

```bash
#!/bin/sh
set -e
if [ "$(id -u)" -eq "0" ]; then
echo "This script must NOT be run as root" 1>&2
exit 1
fi
export CATALINA_BASE="/home/dhis/tomcat-dhis"
/usr/share/tomcat7/bin/startup.sh
echo "Tomcat started"
```

Start DHIS 2

```bash
sudo -u dhis tomcat-dhis/bin/startup.sh
```

There should be considerable initial CPU/RAM usage, after which the app should be visible at MACHINE_IP_ADDRESS:8080/dhis-web-commons/security/login.action. I think the default admin user name is admin and the password is admin - this should obviously be changed immediately.

Monitor for errors (lots of lines beginning “INFO” are OK).

```bash
sudo tail -f tomcat-dhis/logs/catalina.out
```


