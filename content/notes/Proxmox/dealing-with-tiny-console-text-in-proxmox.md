+++
title = "Dealing with tiny console text in Proxmox"
+++

It is easy to do most Proxmox things through the Web interface. You can easily interact with virtual machines through a console in your browser, but the console text is very small and borderline readable for someone like me. You can easily increase the size of the text by changing the console font thus:

```bash
setfont /usr/share/consolefonts/Lat15-Terminus32x16.psf.gz
```

This works on a recent version of Ubuntu. There are lots of other fonts in `/usr/share/consolefonts` that you might prefer. 

As this won't persist across sessions, you can add this as the default to your login shell with:

```bash
echo "setfont /usr/share/consolefonts/Lat15-Terminus32x16.psf.gz" >> ~/.bashrc
```

