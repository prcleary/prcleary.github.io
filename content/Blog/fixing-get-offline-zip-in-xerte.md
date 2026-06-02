---
title: "Fixing \"Get Offline Zip\" in Xerte
date: 2022-11-01
tags:
  - Xerte Online Toolkits
  - e-learning
---

I maintain [Xerte Online Toolkit](https://xerte.org.uk/index.php/en/home) (free e-learning environment) for demonstration purposes and a few trainee projects. I updated it not that long ago to version 3.10 (git v3.10.4-24-g54c8a27). The "Get Offline Zip" functionality, which allows users to download their training materials as a self-contained zip file, has never worked.

Today someone needed that functionality. There was a [clue in the Xerte forums](https://xerte.org.uk/index.php/en/forum/bugs-and-issues/2823-exporting-to-scorm-or-indeed-anything-else-not-working#7964) that this could be because the `php-zip` module for PHP was not installed. XOT is running on a CentOS 7 VM, which I have grown to loathe over the years for making me delve into its innards just to get software installed. Today spent over an hour on this and eventually fixed it by pure luck.

I could see that the `php-zip` extension was not installed. PHP version 7.1 was running.

Some useful PHP commands for next time:

```php
php -m  # what modules are enabled?
php --version  # what version of PHP do you have? I was on 7.1 but have now upgraded to 7.4
php --ini  # find PHP config files
```

Things I did (think it was the upgrade that worked):

```bash
# as root
yum search php-zip  # then install version matching PHP version; didn't work
pecl install zlib zip  # told me to reinstall libzip
yum reinstall libzip  # didn't work
yum install libzip libzip-devel
service httpd restart  # didn't work (did this many times after various changes)
# https://stackoverflow.com/questions/18774568/installing-php-zip-extension/18822464#18822464 was helpful
yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
yum -y install https://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum -y install yum-utils
yum-config-manager --enable remi-php74
yum update
yum install php-pecl-zip
pecl install zip
service httpd restart
```

After that it worked. I was previously maintaining Shiny Server on this VM, and kept it going through vast amounts of compiling stuff from source, including later versions of the compiler toolchain at one point. I think if you are just e.g. running a web server then CentOS 7 (or successors like RockyLinux) are a solid choice, but if you are going to need recent versions of software then avoid.

