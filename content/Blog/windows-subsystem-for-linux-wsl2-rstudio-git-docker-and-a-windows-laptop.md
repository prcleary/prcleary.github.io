---
title: "Windows Subsystem for Linux (WSL2), RStudio, Git, Docker and a Windows laptop"
date: 2022-10-29
tags:
  - Linux
---

### WSL1

I had previously managed to get version 1 of WSL working after a fashion (though Docker didn't work unfortunately).

You have to enable WSL and you may also need to enable virtualisation (don't think I needed to do that, but I may have done it previously and forgotten).

### Install Windows Subsystem for Linux (WSL2)

WSL2 should be easier to set up and use.

If you are on a corporate laptop, you will either need to ask your IT department to install WSL for you (should be version 2) or be given local administrator rights. I took the latter route.

If you can install it yourself, find Windows PowerShell in the Windows menu, then find the suboption "Run as Administrator". You will need to enter your local admin password so have it ready. Run this in PowerShell:

```powershell
wsl --install
```

I had previously installed WSL (version 1) so to make it use version 2 by default (which you want):

```powershell
wsl --set-default-version 2
```

### Install a Linux distribution ("distro")

Next you want to decide which Linux distro you want. I recommend an Ubuntu Long Term Support version unless you are an experienced Linux user with particular preferences or needs. You can check which ones are available in PowerShell (I don't think you need to do the rest of this as a local administrator) to with:

```powershell
wsl --list --online
```

I get the following:

```
The following is a list of valid distributions that can be installed.
Install using 'wsl --install -d <Distro>'.

NAME            FRIENDLY NAME
Ubuntu          Ubuntu
Debian          Debian GNU/Linux
kali-linux      Kali Linux Rolling
openSUSE-42     openSUSE Leap 42
SLES-12         SUSE Linux Enterprise Server v12
Ubuntu-16.04    Ubuntu 16.04 LTS
Ubuntu-18.04    Ubuntu 18.04 LTS
Ubuntu-20.04    Ubuntu 20.04 LTS
```

Although the latest LTS Ubuntu (22.04) has not been added to this (though it can be [manually installed](https://learn.microsoft.com/en-us/windows/wsl/install-manual)), I have gone with installing the 20.04 version.

```powershell
wsl --install -d Ubuntu-20.04
```

It will open another window where it will ask you to create a user name and password for Linux (separate to your Windows ones). Then in that window you will end up at the Linux command line. You can then try to update your system as per [[updating-an-ubuntu-server|this]]. If you get any timeout errors, it may be that the network is not configured correctly, in which case running the command below might help:

```bash
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
```

Then try to update again. Any time you have network issues run it again. I haven't found a permanent fix yet.

If you want to install Linux apps into WSL2, you can use e.g.

```bash
sudo apt install wget make git
```

You will be asked for your Linux password.

### Using WSL2

You should then be able to open RStudio and open Terminal Options to set WSL2 Bash as your default terminal.

Or you can run RStudio Server from WSL2 Linux and connect to it via your Windows browser. This is really cool. All I needed to do was:

```bash
sudo apt -y install r-base
sudo apt install gdebi-core build-essential libcurl4-gnutls-dev libxml2-dev libssl-dev
wget https://rstudio.org/download/latest/stable/server/bionic/rstudio-server-latest-amd64.deb
sudo gdebi rstudio-server-latest-amd64.deb
sudo rstudio-server start
```

Then in my Windows browser I can access RStudio on <http://localhost:8787/> (log in with your Linux user name and password). It seems to run faster than the Windows desktop version! [This](https://jmgirard.com/rstudio-wsl2/) was really helpful.

Looks like Docker won't work (without Docker Desktop on Windows) but no worries, we can have `podman` instead.

```bash
echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_20.04/ /" | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list
curl -L "https://download.opensuse.org/repositories/devel:/kubic:\
/libcontainers:/stable/xUbuntu_20.04/Release.key" | sudo apt-key add -
sudo apt update
sudo apt-get -y  upgrade  # not sure this does anything
sudo apt install podman
podman --version
sudo podman run hello-world
```

Managed to run Jupyter with an R kernel from a podman container. It didn't work at first (as in I couldn't connect from a Windows browser to a service running in WSL2) so I [disabled FastBoot](https://www.tenforums.com/tutorials/4189-turn-off-fast-startup-windows-10-a.html). I also added `localhostForwarding=true` to the `.wslconfig` file on Windows. Neither of those seemed to help.

But then I found that I needed to use the Linux IP address instead of 127.0.0.1, and to make sure I mapped the port number in the podman command.

To get Linux IP address (in WSL2):

```bash
ip addr | grep 172
```
Look for an IP address (4 numbers separated by dots) looking like e.g. 172.22.181.72

To run the podman container:

```bash
sudo podman run -it -p 8888:8888 jupyter/r-notebook
```

The output gives you a URL at the end like this:

```
http://127.0.0.1:8888/lab?token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Change the 127.0.0.1 part to the Linux IP address you got in the step above, i.e. to something like:

```
http://172.22.181.72:8888/lab?token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

You should see Jupyter running in your browser!

You can use Git on WSL2 Linux and e.g. clone things from GitHub, but it won't be able to access anything within your corporate network by default.

Your Linux stuff is on a different filesystem to your Windows stuff and it may be best to keep them distinct. You can look at your Linux stuff from Windows in Windows Explorer by entering `\\wsl$` in the address bar.

Running GUI Linux apps may or may not work (didn't for me but I didn't spend long troubleshooting).

You can close everything now, but next time you want to use WSL2 Linux, just open PowerShell (as ordinary user) and run

```powershell
wsl ~
```

