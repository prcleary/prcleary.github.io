+++
title = "Automating Bitwarden Send"
+++

Not many years ago your local IT department might be alarmed to learn that you were using a password manager. A password manager is a software tool running on your computer and/or in your browser which helps you keep track of your login details for different websites. The key advantage is that you can create a different long, complex password (I use at least 20 characters from a-z, A-Z, 0-9 plus special characters) for every site without having to remember any of them; the downside is if your password manager gets hacked. However, if your alternative to using a password manager is to use the same passwords (or variations) across sites, then that is far more risky. The UK National Cybersecurity Centre now [recommends the use of password managers](https://www.ncsc.gov.uk/blog-post/what-does-ncsc-think-password-managers). 

I used [LastPass](https://www.lastpass.com/) for several years and was happy with it, but after they got [hacked](https://www.schneier.com/blog/archives/2022/12/lastpass-breach.html) to some extent a couple of times, and my subscription came to  its end, I decided to switch to hosting my own password manager with [Vaultwarden](https://github.com/dani-garcia/vaultwarden), an open-source version of [Bitwarden](https://bitwarden.com/). It was easy to set up and to transfer my existing passwords from LastPass. It works well with the Bitwarden extension for Firefox and can handle the new [passkeys](https://research.kudelskisecurity.com/2024/03/14/passkeys-under-the-hood/) that may replace passwords in future. It can also take care of multi-factor authentication, though that's too many eggs in one basket for me - I use MFA wherever I can but manage that separately. 

I find that open-source software often has all the features I need, sometimes even before I realise I need them. As part of my laboratory work I was looking for a way to securely send links (via SMS ultimately) to download lab reports, when I realised that Vaultwarden can do this too, using [Bitwarden Send](https://bitwarden.com/help/send-cli/). 
It creates a URL which allows you to share some text or a file - you can add a password, or specify an expiry period. You can can do it in the Web app or via a command-line interface if you need to automate the process. 

I've played with the CLI tool but I'm still thinking about how it would fit into my desired workflow. It's not difficult to set up; there is nothing to do at the server end, just download and unzip the CLI executable to your local machine.  Installation instructions and the list of commands are [here](https://bitwarden.com/help/cli/). 

**At the time of writing, the latest versions of the tool have a bug which stops you sending file attachments; I found that using the 1.22.1 version from [here](https://github.com/bitwarden/cli/releases) worked fine.**

A sample session (in Windows here) could be (there are many more commands):

```bash
./bw config server https://subdomain.domain.tld  # give it the URL for your self-hosted instance of Vaultwarden
./bw login  # enter your email address then your master key for that instance - it gives you a session key to use in the next command
export BW_SESSION="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
./bw list items  # view your passwords
./bw logout  # when done
```

(I'm still using R for things I should be using Python for) so my next question was: can I automate this in R? The answer is yes, though it is a bit more complicated. You need to log in to the web app and go to Security/Settings/Keys to get your API key. Your API key will be in two parts: an ID and a secret, which are both just text. Once you have these, you have all the information necessary and can save it securely on your local machine with the following R code:

```r
keyring::key_set('bw_url', prompt = 'Enter BW URL: ')
keyring::key_set('bw_clientid', prompt = 'Enter BW client ID: ')
keyring::key_set('bw_clientsecret', prompt = 'Enter BW client secret: ')
keyring::key_set('bw_masterkey', prompt = 'Enter BW master key: ')
```

Make sure that the unzipped, downloaded CLI executable is in the same directory as the R code.

You can then use the following R function to get a session key:

```r
bw_login_apikey <- function() {
  Sys.setenv(BW_CLIENTID = keyring::key_get('bw_clientid'))
  Sys.setenv(BW_CLIENTSECRET = keyring::key_get('bw_clientsecret'))
  Sys.setenv(BW_PASSWORD = keyring::key_get('bw_masterkey'))
  suppressWarnings({
    system(paste('bw logout'), intern = TRUE)
    system(paste('bw config server', keyring::key_get('bw_url')), intern = TRUE)
    system('bw login --apikey', intern = TRUE)
    output <- system('bw unlock --passwordenv BW_PASSWORD', intern = TRUE)
  })
  strsplit(output[grepl('export BW_SESSION', output)], '\"')[[1]][2]  # hack
}
```

Example usage would be:

```r
session_token <- bw_login_apikey()
```

The following two functions allow you send either text or a file:

```r
bw_sendtext <- function(msg, session_token) {
  output <- system(paste('bw send', shQuote(msg), '--session', session_token),
                   intern = TRUE)
  jsonlite::fromJSON(output)
}

bw_sendfile <- function(filename, session_token) {
  output <- system(paste('bw send -f', shQuote(filename), '--session', session_token),
                   intern = TRUE)
  jsonlite::fromJSON(output)
}
```

To send some text (and view the result):

```r
bw_sendtext('Hello world!', session_token)$accessUrl |> browseURL()
```

To send a file (and view the result):

```r
bw_sendfile('bw_send.R', session_token)$accessUrl |> browseURL()
```

Next I needed to work out how to interact with the API of an SMS gateway to be able to send the URL as a text - that can be a future post.
