---
title: "Fun with file formats: todo.txt and the iCalendar format"
date: 2023-06-24
tags:
  - R
  - Productivity
---

After careful pruning, I have 600+ tasks that I need to move into my [[Getting Things Done, the todo.txt format and the quest for the perfect productivity system]].

If I can convert my todo.txt file into [iCalendar format](https://pinboard.in/search/u:prcleary?query=icalendar) I can then import that into Nextcloud. Strangely, you can't import tasks directly into the Nextcloud Tasks app, but if you import tasks into the Calendar app (Calendar settings/Import calendar) they will then appear in the Tasks app.

I can connect the Tasks.org mobile app by providing my login details and this URL: `https://your_subdomain.your_domain/remote.php/dav`

As a reminder, todo.txt files look like this:

```
(A) 2023-06-24 Buy milk @home
(B) 2023-06-24 Contact Fred Bloggs re book chapter @book @ch9
(B) 2023-06-24 Draft concept paper on data and technology for global health @gh due:2023-07-01
(B) 2023-06-24 Upgrade PHP on server @geek
(C) 2023-06-24 Set spend cap on kids' mobiles @home
(C) 2023-06-24 Sign up for sponsored Ben Nevis walk @home due:2023-07-24
2023-06-24 Put bins out @home rec:1m
2023-06-24 Read about FHIR @reading
```

Note the tasks above have date stamps. Some have due dates and one task is recurring. One task has more than one project tag.

The iCalendar format (.ics files) is also a text format, but much more verbose - the same tasks would look like this:

```
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//SabreDAV//SabreDAV//EN
X-WR-CALNAME:Tasks
X-APPLE-CALENDAR-COLOR:#0082c9
REFRESH-INTERVAL;VALUE=DURATION:PT4H
X-PUBLISHED-TTL:PT4H
BEGIN:VTODO
SUMMARY:Buy milk
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:2
CATEGORIES:home
UID:1-35f25791-26a1-4fb8-855e-bd1094e38970
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Contact Fred Bloggs re book chapter
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:5
CATEGORIES:book,ch9
UID:2-f6a02fb5-039e-4e5f-be92-5fd10a1d356e
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Draft concept paper on data and technology for global health
DUE:20230701T000000Z
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:5
CATEGORIES:gh
UID:3-d6b01b00-11e8-4224-91f7-7b01205a09c6
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Upgrade PHP on server
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:5
CATEGORIES:geek
UID:4-923e8ca7-3b1b-4a9d-b898-4c67cd68d94e
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Set spend cap on kids' mobiles
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:6
CATEGORIES:home
UID:5-2d5a3a98-6192-407b-84b5-1b11d726be84
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Sign up for sponsored Ben Nevis walk
DUE:20230724T000000Z
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:6
CATEGORIES:home
UID:6-0f163e7b-156d-4d93-b31f-a147ee5c995b
DTSTAMP:20230624T000000Z
END:VTODO
BEGIN:VTODO
SUMMARY:Put bins out
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:9
CATEGORIES:home
UID:7-3fd3e345-8c16-44aa-a7c9-52c8e23d7768
DTSTAMP:20230624T000000Z
RRULE:FREQ=MONTHLY;BYMONTHDAY=14
END:VTODO
BEGIN:VTODO
SUMMARY:Read about FHIR
STATUS:NEEDS-ACTION
PERCENT-COMPLETE:0
PRIORITY:9
CATEGORIES:reading
UID:8-1ef4b4a6-f9f7-455f-9f1b-64b334374dfe
DTSTAMP:20230624T000000Z
END:VTODO
END:VCALENDAR
```

The full iCalendar format is documented [here](https://www.rfc-editor.org/rfc/rfc5545.html), in an RFC (a "Request For Comments", which is how Internet standards are published).

- Tasks are demarcated by `BEGIN:VTODO` and `END:VTODO` and each can have several fields, of which most seem to be optional (but none of which should be blank).
- `SUMMARY` is the task description.
- `PRIORITY` is a number from 0 to 9; 0 means undefined; lower numbers mean higher priority.
- Note how dates have to be formatted (`YYYYMMDDTHHMMSSZ`), `T` meaning "time" and `Z` meaning time zone (UTC by default).
- `STATUS` can be `NEEDS-ACTION`, `COMPLETED`, `IN-PROCESS`, `CANCELLED`, and possibly other things too.
- The `RRULE` field describes task recurrence.

I generated the .ics file from a todo.txt file with the R script below.

- I didn't account for or include completed tasks but I could have done.
- I captured date stamps and roughly mapped over priorities and recurrences - these are the bits that are most likely to need tweaking if your todo.txt does not look like the example.
- I also generated unique identifiers for my tasks, and a couple of other default fields, but I am not sure that was essential.
- I wrote the `regexextract` function (named after a Google Sheets function that does something similar) to extract parts of the text using regular expressions.

The trickiest part of all of this was getting the regular expressions right - regular expressions probably deserve a future post of their own.

All of my tasks now appear in Nextcloud Tasks, and also appear on my phone in the Tasks.org app. Let's see how it goes.

```r
#todo2tasks.R

# Constants
TODOTXT_LOCATION <-
  'C:/Users/fred.bloggs/Desktop/todo.txt'
PRIORITIES <- c(
  A = 2,
  B = 5,
  C = 6,
  D = 7,
  E = 8
)
RRULES <- c(
  '+1w' = 'FREQ=WEEKLY;BYDAY=MO',
  '1w' = 'FREQ=WEEKLY;BYDAY=MO',
  '+2w' = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO',
  '+1m' = 'FREQ=MONTHLY;BYMONTHDAY=14',
  '1m' = 'FREQ=MONTHLY;BYMONTHDAY=14',
  '+2m' = 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=14',
  '2m' = 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=14',
  '+3m' = 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=14',
  '3m' = 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=14',
  '+1y' = 'FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=14'
)
header <- c(
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'CALSCALE:GREGORIAN',
  'PRODID:-//SabreDAV//SabreDAV//EN',
  'X-WR-CALNAME:Tasks',
  'X-APPLE-CALENDAR-COLOR:#0082c9',
  'REFRESH-INTERVAL;VALUE=DURATION:PT4H',
  'X-PUBLISHED-TTL:PT4H'
)
footer <- c('END:VCALENDAR')

# Functions
library(data.table)
library(uuid)
date_format <- function(x) {
  # Takes string in YYYY-MM-DD format
  # Returns formatted date (or blank)
  fifelse(x %chin% '',
          '',
          format(as.Date(x), '%Y%m%dT%H%M%SZ'))
}
regexextract <-
  function(x,
           pattern,
           perl = FALSE,
           simplify = FALSE) {
    # Takes string
    # Returns matched patterns
    result <- regmatches(x, gregexpr(pattern, x, perl = perl))
    result <-
      lapply(result, function(x)
        if (identical(character(0), x))
          ''
        else
          x)
    if (simplify) {
      sapply(result, function(x)
        x)
    } else {
      result
    }
  }
name_value <- function(x) {
  # Takes variable
  # Produces "variablename:variablevalue"
  paste0(substitute(x), ':', x)
}

# Read and munge todo.txt data
todotxt <- data.table(task = readLines(TODOTXT_LOCATION))

# SUMMARY
# Extract up to due:, rec:, tag or end of line
# Then extract right of date stamp
todotxt[, todotxt_summary := regexextract(task,
                                          '^.*?(?=due:|rec:|@|$)',
                                          perl = TRUE,
                                          simplify = TRUE)]
todotxt[, SUMMARY := regexextract(
  todotxt_summary,
  '(?<=\\d{4}-\\d{2}-\\d{2} ).*?(?=$)',
  perl = TRUE,
  simplify = TRUE
)]

# DUE
# Due date from "due:" to either end of line or space
todotxt[, todotxt_due := regexextract(task,
                                      '(?<= due:).*?(?=$|\\s)',
                                      perl = TRUE,
                                      simplify = TRUE)]
todotxt[, DUE := date_format(todotxt_due)]

# STATUS
todotxt[, STATUS := 'NEEDS-ACTION']

# PERCENT-COMPLETE
todotxt[, PERCENTCOMPLETE := 0]

# PRIORITY
# Priority from opening bracket at start of line
# to closing bracket
todotxt[, todotxt_priority := regexextract(task,
                                           '(?<=^\\().*?(?=\\))',
                                           perl = TRUE,
                                           simplify = TRUE)]
todotxt[, PRIORITY := PRIORITIES[todotxt_priority]]
todotxt[is.na(PRIORITY), PRIORITY := 9]

# CATEGORIES
# Categories from "@" to either end of line or space
todotxt[, todotxt_categories := regexextract(task,
                                             '(?<= @).*?(?=$|\\s)',
                                             perl = TRUE)]
todotxt[, CATEGORIES := sapply(todotxt_categories, function(x)
  paste0(x, collapse = ','))]

# DTSTAMP
# Extract from start of line to end of first date
# Then extract date
todotxt[, todotxt_stamp := regexextract(
  task,
  '(?<=^).{0,4}\\d{4}-\\d{2}-\\d{2}?(?= )',
  perl = TRUE,
  simplify = TRUE
)]
todotxt[, todotxt_stamp := regexextract(todotxt_stamp,
                                        '\\d{4}-\\d{2}-\\d{2}',
                                        simplify = TRUE)]
todotxt[, DTSTAMP := date_format(todotxt_stamp)]

# RRULE
# Extract patterns beginning with "rec:"
todotxt[, todotxt_rrule := regexextract(task,
                                        '(?<= rec:).*?(?=\\s|$)',
                                        perl = TRUE,
                                        simplify = TRUE)]
todotxt[, RRULE := RRULES[todotxt_rrule]]
todotxt[is.na(RRULE), RRULE := '']

# Create .ics file
# NB: format does not like blank fields
n <- nrow(todotxt)
vtodo <- lapply(1:n, function(i) {
  todotxt[i,
          c(
            'BEGIN:VTODO',
            name_value(SUMMARY),
            if (!DUE %in% '')
              name_value(DUE),
            name_value(STATUS),
            paste0('PERCENT-COMPLETE:', PERCENTCOMPLETE),
            name_value(PRIORITY),
            if (!CATEGORIES %in% '')
              name_value(CATEGORIES),
            paste0('UID:', i, '-', UUIDgenerate()),
            name_value(DTSTAMP),
            if (!RRULE %in% '')
              name_value(RRULE),
            'END:VTODO'
          )]
})
ics <- c(header, unlist(vtodo), footer)
writeLines(ics, con = 'tasks.ics')
```

