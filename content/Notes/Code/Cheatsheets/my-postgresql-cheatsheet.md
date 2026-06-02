---
title: My PostgreSQL cheatsheet
date: 2023-08-24
tags:
  - PostgreSQL
  - Cheatsheet
---

### Find Postgres config file (as root) and set up database logging

```bash
psql -U postgres -c 'SHOW config_file'
```

To start logging, make the following changes:

```
log_destination = 'csvlog'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

then

```bash
systemctl restart postgresql@12-main.service
```

then e.g.

```bash
tail -f /var/lib/postgresql/12/main/log/postgresql-2023-08-15_202128.csv
```

### Starting and stopping PostgreSQL database.

Seem to be multiple ways!

```bash
sudo service postgresql start
sudo service postgresql stop
sudo service postgresql restart
```

```bash
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
```

```bash
sudo /etc/init.d/postgresql start
sudo /etc/init.d/postgresql stop
sudo /etc/init.d/postgresql restart
```

### Log into PostgreSQL database

```bash
sudo -u postgres psql  # general
sudo -u dhis psql dhis2 dhis  # specific to DHIS 2
psql -Uclinlims clinlims  # specific to OpenELIS
```

### Commands in PostgreSQL

- `\?`: help!
- `\dt`: list tables
- `\du`: list users
- `\l`: list databases
- `\q`: quit
- `\x`: make output prettier (expanded format)
- `pset format unaligned`: get rid of all hyphens
- `\c <db name>`: connect to database

More commands [here](https://www.postgresql.org/docs/current/app-psql.html)

### Clear database

Stop Tomcat then

```bash
psql -U dhis -d dhis2 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

and then log out

### Delete database

```bash
sudo -u postgres dropdb dhis2
```

### Upload data and metadata into database.

```bash
sudo -u dhis psql -d dhis2 -U dhis -f 2019-07-24_backup.sql
```

### Running upgrade script on database.

Example given upgrading to version 2.30 (different/not required for later versions)

```bash
wget https://raw.githubusercontent.com/dhis2/dhis2-releases/master/releases/2.30/upgrade-230.sql
cat upgrade-230.sql | sudo -u dhis psql dhis2
```

### Solution for: Key (trackedentityinstanceid)=(xxxxxxxx) is still referenced from table "trackedentityprogramowner"

```sql
DELETE from trackedentityprogramowner where trackedentityinstanceid in (select trackedentityinstanceid from trackedentityinstance where deleted = 't');
```

There's some related stuff [here](https://github.com/prcleary/dhis2_scripts).

