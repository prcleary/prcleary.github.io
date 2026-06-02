---
title: First steps with setting up demonstration versions of open source software platforms in the cloud
date: 2022-11-19
tags:
  - Linux
---

Setting up a demonstration version of an open source web service is a good way of helping to assess its feasibility, suitability and acceptability for a particular digital health application.

It requires a variety of skills which can be acquired by anyone with a "can do" attitude, curiosity and persistence.

You don't need to become a Linux expert but you should know [[linux-commands-you-should-really-know|the basic **Linux commands**]] and be able to understand what any commands you copy and paste are doing.

You can acquire the basics in a number of ways:
- dig out old computer hardware and install Linux on it (you might be surprised how easy this is these days if you tried it previously)
- use GitBash on Windows
- use Windows Subsystem for Linux
- do an online course (there are many free ones)

You will never regret learning more Linux.

If you are going to set up an online service then you will probably not want to install something on the computer in front of you and then expose that to the Internet (you can do that but it is probably not wise). You will probably want your service to run on another computer somewhere (called a **server**) that is always on and always connected to the Internet.

You can acquire your own server hardware and do this yourself, but it is often easier and cheaper to pay a company to provide you with some server space in **"the cloud"**. Think of the cloud as computer hardware running somewhere else in the world which offers massive computing resource for hire. It is not something running "in the ether" as some people seem to think (I think they may be confusing it with wifi).

There are lots of different companies offering cloud services. I have used a few - Digital Ocean is easy for starting with, and Hetzner is cheaper once you know what you are doing. You will find that companies offer a whole range of different cloud services; what you should look for are called "Virtual Private Servers" (**VPS**). These will usually come with different amounts of RAM or CPU power; when you are starting out you can just go with the cheapest (often not much more than £5/month, though some are free). They will also usually offer a range of different operating systems; a good one to use is called Ubuntu (if several versions of Ubuntu are available then go for the most recent Long Term Support version, or one that is known to be compatible with the software platform you want to use). Once you have a VPS you should note down its IP address (four numbers separated by dots, e.g. 153.54.9.27) as you will need this to connect to it.

To access a VPS in the cloud, it is common to use something called **SSH** or Secure Shell. SSH is an example of a "network protocol" (basically just a standardised way for computers to communicate across a network). SSH allows you to connect your computer to your VPS so that you can type Linux commands into a terminal on the computer in front of you, which are then run on the server. There is a tool for Windows called PuTTY which allows you to connect to your Linux server using SSH.

Once you have your VPS and can connect via SSH, you can start running commands on your server. There will always be some setup steps to do next, such as updating the system, creating users and taking some necessary security measures.

Once you have installed your web service and checked that it is running OK you may wish to obtain a **domain name** for your server, such as "mycloudadventure.net". You obtain these from "domain registrars" and again you can sometimes get these free, though more often it will cost you around £20/year. When someone enters your domain name into their browser, your browser will look up the IP address for that domain name, in a system called **DNS** (the domain name system), which allows it to connect to your web service.

Humans can't remember IP addresses easily, so we assign domain names to IP addresses and then use DNS like a telephone directory to look up the IP addresses actually needed. And you can point more than one domain name at an IP address.

OK, now down to the nitty-gritty.

I acquired a VPS from Hetzner running Ubuntu 20.0.2 which I want to install something on. I went for a VPS with 4GB of RAM, which should hopefully be enough. I noted down the IP address and now want to connect via SSH.

While creating the VPS in Hetzner I supplied a **public key** for SSH. You should in general not allow connections to your server using only a password as authentication (though initially you may have no other option). It is more secure to create a **key pair** and use that.

You can generate the key pair on your local machine (i.e. the computer in front of you) with (in GitBash):

```bash
ssh-keygen -t rsa
```

You will be asked a series of questions and can press Enter to accept the default responses except when asked for the "passphrase", when you should enter a strong password (at least 14 characters long and a mixture of lower and upper case letters, numbers and special characters such as ^/!/? etc). You will have to enter it twice.

What this does is create two "keys" in a special folder on your local machine (on Windows machine it will probably be C:\Users\firstname.secondname\.ssh). One of them is a file ending ".pub" (by default it may be called `id_rsa.pub`) - this is your public key - you can give this to anyone and they can use this to check you are you (authentication). The other file is a **private key** (no file ending; by default called `id_rsa`) which you should not share with anyone.

How this works is that if someone wants to check that you are you, they can encrypt a message with the public key and then send it to you; only you can decrypt it because only you have your private key. This is what happens behind the scenes (you don't have to do it manually) when you connect via SSH using keys to prove who you are.

Next steps may include (depending on what you are installing):

- Copy your public key to the VM if not already done (using `scp` or FileZilla)
- Finish securing SSH configuration, e.g. changing the SSH port, preventing password authentication (be careful not to lock yourself out)
- Configure a subdomain with your DNS provider to point at the IP address of your VM.
- Install and configure the `ufw` firewall and the `fail2ban` service for preventing brute force login attempts
- Install and configure software dependencies e.g. Docker/Docker Compose, Java
- Configure any environment variables required
- Deploy your software platform

