+++
title = "Running Python apps from R"
+++

You too can run Python apps from R. I did the following in RStudio:

- Install the `reticulate` package. 
- Run one of the scripts below.

It will install everything required in a separate Python virtual environment, i.e. isolated from any other Python setup on your computer.

## `pyspread`

Link: [Welcome to pyspread | pyspread](https://pyspread.gitlab.io/)

Want to use Python in your spreadsheet and tired of waiting for your corporate IT to roll that out? Try `pyspread`.

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('pyspread')
	
use_virtualenv('pyspread')

if (first_run) {
  install_python()
  py_install('pyspread', pip = TRUE)
}

python_path <- py_exe()
system2(python_path, '-m pyspread')
```

## `datasette`

Link: [Datasette: An open source multi-tool for exploring and publishing data](https://datasette.io/)

An interactive Web app for exploring a SQLite database (might use this to improve my SQL)

Download and unzip the training database `chinook.db` (to the same folder as the R script) from [here](https://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip).

The app should open in your browser.

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('datasette')

use_virtualenv('datasette')

if (first_run) {
  install_python()
  py_install('datasette', pip = TRUE)
}

python_path <- py_exe()
browseURL('http://127.0.0.1:8001')
system2(python_path, '-m datasette serve chinook.db')
```

## `howdoi`

Link: [gleitz/howdoi: instant coding answers via the command line](https://github.com/gleitz/howdoi)

Search for help with programming tasks from the command line

Only partial success with this one - search engines block automated queries in Europe because cookies have not been accepted (I will have to try this one with a VPN)

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('howdoi')

use_virtualenv('howdoi')

if (first_run) {
  install_python()
  py_install('howdoi', pip = TRUE)
}

python_path <- py_exe()
Sys.setenv(HOWDOI_SEARCH_ENGINE = 'bing')  # or google, duckduckgo
howdoi <- function(query) {
  cmd <- paste('-m howdoi', query)
  system2(python_path, cmd)
}
```

Example usage:

```r
howdoi('howdoi')
howdoi('format bash date')
```

## `httpie`

Link: [HTTPie – API testing client that flows with you](https://httpie.io/)

Interact with Web APIs from the command line (this could be very useful)

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('httpie')
	
use_virtualenv('httpie')

if (first_run) {
  install_python()
  py_install('httpie', pip = TRUE)
}

https <- function(query) {
  https_path <- file.path(py_config()$pythonhome, 'Scripts', 'https.exe')
  system2(https_path, query)
}
```

Example usage:

```r
https('httpie.io/hello')  # their test server
```

Returns JSON:

```
{"ahoy":["Hello, World! 👋 Thank you for trying out HTTPie 🥳","We hope this will become a friendship."],"links":{"homepage":"https://httpie.io","twitter":"https://twitter.com/httpie","discord":"https://httpie.io/discord","github":"https://github.com/httpie"}}
```

## `yt-dlp`

Link: [yt-dlp/yt-dlp: A feature-rich command-line audio/video downloader](https://github.com/yt-dlp/yt-dlp)

Download YouTube videos

- not adapted for Linux but you would probably just use `yt-dlp` directly anyway

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('yt-dlp')

use_virtualenv('yt-dlp')

if (first_run) {
  install_python()
  py_install('yt-dlp', pip = TRUE)
}

yt_dlp <- function(query) {
  yt_dlp_path <- file.path(py_config()$pythonhome, 'Scripts', 'yt-dlp.exe')
  system2(yt_dlp_path, '-o', query)
}
```

Usage:

```r
yt_dlp('https://www.youtube.com/watch?v=6541wEO_04o')
```

Output:

```
[youtube] Extracting URL: https://www.youtube.com/watch?v=6541wEO_04o
[youtube] 6541wEO_04o: Downloading webpage
[youtube] 6541wEO_04o: Downloading ios player API JSON
[youtube] 6541wEO_04o: Downloading web creator player API JSON
[youtube] 6541wEO_04o: Downloading m3u8 information
WARNING: ffmpeg not found. The downloaded format may not be the best available. Installing ffmpeg is strongly recommended: https://github.com/yt-dlp/yt-dlp#dependencies
[info] 6541wEO_04o: Downloading 1 format(s): 18
[download] Destination: How Best to Run Python in RStudio Using the Reticulate Library in R [6541wEO_04o].mp4
[download] 100% of    9.85MiB in 00:00:04 at 1.98MiB/s  
```

## `hawk-eye`

Link: [rohitcoder/hawk-eye: A powerful scanner to scan your Filesystem, S3, MySQL, Redis, Google Cloud Storage and Firebase storage for PII and sensitive data.](https://github.com/rohitcoder/hawk-eye)

Scan your filesystem (and much more) for sensitive credentials (identifiable by regular expressions). 

Instructions for installation and simple use via R below. Put the following two configuration files in your working directory:

- `fingerprint.yml` from [hawk-eye/fingerprint.yml at main · rohitcoder/hawk-eye](https://github.com/rohitcoder/hawk-eye/blob/main/fingerprint.yml) - the regular expressions it will look for
- `connection.yaml`: I used the configuration below (to scan my Desktop)
  ```
  notify:
    redacted: True
    suppress_duplicates: True

  sources:
    fs:
      mydesktop:
        path: "C:/Users/fred.bloggs/Desktop"
        exclude_patterns:
          - .pdf
          - .docx
          - private
          - venv
          - node_modules
  ```

```r
first_run <- TRUE  # change to FALSE after first run

library(reticulate)

if (first_run)
  virtualenv_create('hawk-scanner')

use_virtualenv('hawk-scanner')

if (first_run) {
  install_python()
  py_install('hawk-scanner', pip = TRUE)
}
hs_path <- file.path(py_config()$pythonhome, 'Scripts', 'hawk_scanner.exe')
system2(hs_path, 'fs --connection connection.yaml --fingerprint fingerprint.yml')
```

If there are lots of files it will run for ages and possibly max out your CPU.

## Troubleshooting

- if trying to run Python on your Windows machine opens an app store then check out this tip: [CMD opens Windows Store when I type 'python' - Stack Overflow](https://stackoverflow.com/questions/58754860/cmd-opens-windows-store-when-i-type-python) 

