+++
title = "Adding translated subtitles to video recordings of presentations, using large language models"
+++

As part of my LIMS implementation I have been delivering training sessions in my native English to non-native English speakers. I usually consciously try to speak slowly but I have realised I may need to do more to increase accessibility for non-native speakers. It's possible a British accent is more difficult to understand (even in the US I found I needed to speak in a mid-Atlantic way to avoid occasional incomprehension). Recently I was excited to find an easy way to add translated subtitles to a presentation recording without using any online services. 

If you use Teams as we do, and record a meeting, you can then download the recording as an MP4 file. You can then use a Python package to create and embed subtitles in the file. 

The original version of the Python package is here: [m1guelpf/auto-subtitle: Automatically generate and overlay subtitles for any video.](https://github.com/m1guelpf/auto-subtitle) - this allows you to generate subtitles in the language spoken in the video. It uses one of the open source OpenAI Whisper LLMs for this.

Whisper is also capable of translating into other languages and `auto-subtitle` has been forked to add this capability to the Python package: [adills/auto-subtitle: Automatically generate and overlay subtitles for any video.](https://github.com/adills/auto-subtitle)

I did the following on Linux (I am still using Elementary OS, based on Ubuntu, though I am itching to change distro again). You should be able to get it to work on Windows if you have permission to install the `ffmpeg` software.

Note that I have a GPU on my Linux machine - I am not yet sure if that is required but I don't think so.

Firstly install dependencies - note that there are some packages with similar names which will not work, and you may need to uninstall those:

```bash
sudo apt update; sudo apt install ffmpeg
pip install ffmpeg-python  # not `python-ffmeg` or `ffmpeg`! use `pip uninstall` if needed
```

Install the Python package from the forked repo:

```bash
pip install git+https://github.com/adills/auto-subtitle
```

You can then add English subtitles with e.g.:

```bash
auto_subtitle teamsmeeting.mp4 -o subtitled/
```

It will create a "subtitled" folder if none exists and the subtitled video file will be in there when it is finished. The English subtitles were very accurate, even with my weird accent.

At my first attempt the file created could not be opened on Windows or Linux. Thinking the video file from Teams might contain some weird codecs, I converted it to `.webm` format with the code below (which took hours, multiple times the duration of the video) and the video file was then viewable. At later attempts this was not required. I think I had possibly tried to open it before it was completely finished.

```bash
fmpeg -i subtitled/teamsmeeting-subtitled.mp4 /subtitled/teamsmeeting-subtitled-converted.webm
```

To add subtitles translated into a different language (here Urdu, but quite a few languages are available) I used: 

```bash
auto_subtitle teamsmeeting.mp4 -o subtitled/ --task translate --language_out ur --model medium
```

After a long wait, this produced what a colleague has told me is an accurate translation into Urdu, but with the words broken in a way impeding readability. I have barely scratched the surface of this so my explorations continue.


