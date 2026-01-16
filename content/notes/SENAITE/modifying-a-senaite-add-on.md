+++
title = "Modifying a SENAITE add-on"
+++

The lab I am working with needs to add some additional patient identifiers to its sample requests. SENAITE (with the `senaite.patient` add-on) has an unsatisfactory solution to this: you can add arbitrary identifiers, but only if you go into the Patient listing and add the patient there, i.e. as an additional step to entering the sample request information. Ideally you would be able to enter the additional identifiers at the same time as you enter the sample request information. 

The `senaite.patient` add-on adds patient handling to SENAITE. I forked [the repo](https://github.com/senaite/senaite.patient) and created a branch from the last commit compatible with SENAITE 2.5.0. Then I created a new directory (`src`) in the buildout directory (`/home/senaite/senaitelims`) of my SENAITE installation and cloned the repo into that. 

I had to create a [GitHub Personal Access Token](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls) ("repo" ticked only) to allow me to push from the VM to GitHub. As it happened I never made any changes to code on the VM.

Code so far:

```bash
cd /home/senaite/senaitelims  # the "buildout directory"
mkdir src
cd src
git config --global user.name "Your user name goes here"
git config --global user.email "Your email address goes here"
git remote set-url origin https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/prcleary/senaite.patient.git  # replace xxxx... with your GitHub PAT
git config -l  # check the Git config if you like
git clone https://github.com/prcleary/senaite.patient
cd senaite.patient
git checkout -b additional-fields ce80650  # version 1.4.0 of senaite.patient, for compatibility with SENAITE 2.5.0
git push --set-upstream origin additional-fields  # just git push needed thereafter
```

I also cloned the repo, checked out the `additional-fields` branch and set the upstream branch on my local machine - this is where I tinkered with the code, pushing commits to GitHub and pulling them to the VM SENAITE installation.

Next I had to configure the build process to use the repo, not the Python Package Index version of `senaite.patient`. In the `buildout.cfg` file, add `senaite.patient` under `eggs =` and `src/senaite.patient` under `develop =` not far below. 

I would like to say that I have a good understanding of Plone, which SENAITE is built on. I am starting to get more familiar with concepts such as adapters, subscribers, catalogs, brains etc. I have realised that the add-on machinery is very powerful. But mostly I grepped through the code looking for similar fields (`grep -iRnw . -e 'MRN'` can get you a long way) and used a copy/paste/adapt process. It did require some knowledge of Python classes. As a proof of concept I decided to add a "Test ID" field. 

After making some changes, I would push them to GitHub from my local machine and then do the following on the VM from the buildout directory, to pull the changes, rebuild the app and run the app again (there are ways to reload the app automatically in response to code changes, but I didn't bother with those):

```bash
git -C src/senaite.patient pull
PYTHONHTTPSVERIFY=0 buildout
bin/instance fg
```

Any errors in my code were quickly detected when I tried to run the app. After fixing errors, I logged into the Web app in my browser, created an instance (if I hadn't done so previously) and looked to see if I had the desired functionality. 

After not that many iterations of this process (it was maybe a couple of days work), I had successfully added a "Test ID" field to a Patient, and made it appear in the sample request form. I had to edit more files than I expected - firstly to create the field and thereafter to make it appear in forms and listings, as well as doing other things such as setting permissions. 

You can see the changes I made [here](https://github.com/senaite/senaite.patient/compare/master...prcleary:senaite.patient:additional-fields) thanks to GitHub's cool "compare" functionality. At the time of writing I am up to the "Second attempt" commit. It seems to work, but needs more testing and I might need to make further changes. 

In the process I spotted several other things I could tweak in `senaite.patient` (e.g. why three addresses?). I would still like to add a filter for "Department" to the samples listing view, though I could possibly manage without that. I might even look into making the additional identifiers searchable/indexable. I am still thinking of the best way to ensure that SENAITE data has matching geographies to DHIS 2, so I can import data into DHIS 2 and use it in analytics. 

This all needs to be up and running by some time in October, so I am relieved this wasn't more difficult. I do want to learn Plone properly at some point - I've even wondered whether to use it for my blog (*dogfooding*) but that's very low on my priorities. 

Edit: in later debugging I learned that after any changes you need to uninstall and reinstall the app to check it all works.
