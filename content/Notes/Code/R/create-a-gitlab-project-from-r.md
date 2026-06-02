---
title: Create a GitLab project (from R)
date: 2022-11-11
tags:
  - R
  - Snippet
---

I used to think you had to log in to our GitLab instance to create a project before switching back to GitBash on my local machine to add the remote, but I have just realised that you can do it all from R.

Doing this as part of a "cookie cutter" project which is progressing slowly in fits and starts.

It uses a combination of commands from the `gert` package which work fine for the moment but may not all be necessary.

```r
#' Create A GitLab Project (from R)
#'
#' `create_gitlab_project` creates a project on GitLab for your code without you having to log into GitLab.
#'
#' You don't need to be logged in to GitLab to use this function.
#'
#' By default it will use authentication option "https"; if you haven't set up SSH keys this is what you want.
#' A dialogue box may open the first time requiring you to enter a password or personal access token.
#'
#' Use authentication option "ssh" if you have set up SSH keys.
#'
#' Make sure you have initialised your Git repo before using this.
#'
#' This function is intended for use at the outset of project where the project does not already exist on GitLab.
#' However if the project already exists on GitLab then it will do a "git push" to that project.
#' @param namespace The name of the user or group on GitLab where you want to create the project, e.g. "paul.cleary"
#' @param slug The name of your project you want to create on GitLab (no spaces), e.g. "myproject"
#' @param authentication Either "https" (default) or "ssh"
#' @param base_url The URL for your GitLab instance
#'
#' @return The name of the Git remote created.
#' @export
#'
#' @examples
#' Not run:
#' ## HTTPS authentication
#' # create_gitlab_project(namespace = 'paul.cleary',
#' #                       slug = 'myproject')
#' ## SSH authentication
#' # create_gitlab_project(namespace = 'paul.cleary',
#' #                       slug = 'myproject',
#' #                       authentication = 'ssh')
create_gitlab_project <-
  function(namespace,
           slug,
           authentication = c('https', 'ssh'),
           base_url = '') {  # include your own URL for convenience
    authentication <- match.arg(authentication)
    remote <- switch(
      authentication,
      https = paste0('https://',
                     base_url,
                     '/',
                     namespace,
                     '/',
                     slug,
                     '.git'),
      ssh = paste0('git@',
                   base_url,
                   ':',
                   namespace,
                   '/',
                   slug,
                   '.git')
    )
    gert::git_remote_add(url = remote)
    gert::git_push(remote = remote, set_upstream = FALSE)
    gert::git_push()
    remote
  }

# TODO also create dev branch
```

