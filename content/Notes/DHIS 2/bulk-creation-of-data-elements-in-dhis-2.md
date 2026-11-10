---
title: Bulk creation of data elements in DHIS 2
date: 2023-07-12
tags:
  - R
  - DHIS 2
---

DHIS 2 makes it easy to create new data sets for data collection and analysis. One of the most time-consuming parts of this is creating each data element (in DHIS 2 lingo a data element is a basic item of information that is captured in a form, such as a number or date or bit of text) in the Maintenance app. I was recently asked to set up a new case-based data collection for COVID-19 cases, which required about 50 data elements to be created, and looked into how this could be automated.

There are two types of data element that can be created in DHIS 2: "aggregate" (for reporting data aggregated by time and place) and "tracker" (for reporting individual-level data related to cases or other entities that you define). Both types can be created by uploading a CSV file in a particular format, either through the Import/Export app or through the API.

The CSV file has to be in a specified format, though most of the fields are optional. Here is an example (not real). You will need to minimise the right sidebar to view this properly.

| Name                             | UID | Code                        | Short name                       | Description               | Form name                  | Domain type | Value type               | Aggregation operator | Category combination UID | Url | Zero is significant | Option set                        | Comment option set |
|----------------------------------|-----|-----------------------------|----------------------------------|---------------------------|----------------------------|-------------|--------------------------|----------------------|--------------------------|-----|---------------------|-----------------------------------|--------------------|
| COVID-trz Symptomatic                |     | Use any standard codes here | COVID Symptomatic                | You can put anything here | Symptomatic?               | TRACKER     | BOOLEAN                  | NONE                 |                          |     | FALSE               | Put UIDs for any option sets here |                    |
| COVID-trz Coordinate of residence    |     |                             | COVID Coordinate of residence    |                           | Coordinates of residence   | TRACKER     | COORDINATE               | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Date of onset              |     |                             | COVID Date of onset              |                           | Date of onset of Illness   | TRACKER     | DATE                     | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Date and time of admission |     |                             | COVID Date and time of admission |                           | Date and time of admission | TRACKER     | DATETIME                 | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Patient email              |     |                             | COVID Patient email              |                           | Patient email address      | TRACKER     | EMAIL                    | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Previous vaccine doses     |     |                             | COVID Previous vaccine doses     |                           |                            | TRACKER     | INTEGER_ZERO_OR_POSITIVE | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Other comorbidities        |     |                             | COVID Other comorbidities        |                           | Other comorbidities        | TRACKER     | LONG_TEXT                | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz ID number                  |     |                             | COVID ID number                  |                           | ID number                  | TRACKER     | NUMBER                   | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Patient phone number       |     |                             | COVID Patient phone number       |                           |                            | TRACKER     | PHONE_NUMBER             | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Patient full name          |     |                             | COVID Patient full name          |                           | Patient full name          | TRACKER     | TEXT                     | NONE                 |                          |     | FALSE               |                                   |                    |
| COVID-trz Gender                     |     |                             | COVID Gender                     |                           |                            | TRACKER     | TEXT                     | NONE                 |                          |     | FALSE               |                                   |                    |

You can upload this CSV file into the Import/Export app (Metadata import section) and (if not already created) the data elements will then be available to use.

- Don't import data elements until you are reasonably sure what they are going to be - tweaking them afterwards may only be possible manually
- If using the Import/Export app, do a "dry run" first
- For "What format is the data to import?" specify "CSV"
- Tick the "First row is header" box
- Under "Class key" select "DATA_ELEMENT"
- Then leave the other options as they are and click "Start dry run"
- If no errors are shown and the dry run is successful, repeat the process but click "Start import"

Advice on creating your CSV file

- I try to keep the "Name" field unique within the system, usually by using some sort of prefix specific to the data set (here "COVID-trz")
- The "Form name" field shows what will actually be displayed to the person entering data - bear this in mind.
- You can use "TRACKER" or "AGGREGATE" in the "Domain type" field, depending on the type of data elements you want
- The "Value type" field is important, indicating what type of data is to be collected - see [here](https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-237/metadata.html#webapi_csv_data_elements) for more details
- The "Aggregation operator" field should normally be "NONE" for tracker data elements and "SUM" for aggregate data elements.
- The remaining fields are optional - DHIS 2 will e.g. generate unique IDs for "UID" or use the default for "Category combination UID" - I tend to leave these blank (but don't delete the columns) and do anything else required through the Web interface. You can specify things like "option sets" for data elements (to explain option sets through examples: a data element for gender could have an option set of Male, Female or Other; a data element for lab test result could have an option set for Positive, Negative or Inconclusive) - you can specify this in the CSV file if the option set is already in DHIS 2 and you know its unique identifier

Anything you can do via the Import/Export app can also be done via the DHIS 2 API. I am going to use R to upload these data elements into a demo version of DHIS 2 via the API.

These are the server and login details ready for use in R, and the location of the CSV file:

```r
dhis2_base_url <- 'https://play.dhis2.org/2.37.9.1'
dhis2_username <- 'admin'
dhis2_password <- 'district'
csv_file_location <- 'data-elements-csv.csv'
```

As always, the login details are shown here for demonstration purposes - in real life you would not save your login details in a script.

Here is an R function which will upload the new data elements via the DHIS 2 API. It requires the packages: `data.table`, `httr` and `jsonlite`. The function does the following:

- Reads in the CSV file and removes its header row
- Constructs the appropriate URL to use
- Uses the appropriate HTTP command to send the data to the server
- Unpacks and returns the response from the server so you can see if it has been successful or not

```r
new_data_elements <- function(csv_file_location,
                              dhis2_base_url,
                              dhis2_username,
                              dhis2_password) {
  csv_data <- data.table::fread(csv_file_location)
  data.table::fwrite(csv_data, 'csv_data_no_header_delete_me.csv', col.names = FALSE)
  csv_upload_url <- httr::parse_url(dhis2_base_url)
  csv_upload_url$path <-
    paste0(csv_upload_url$path, '/api/metadata')
  csv_upload_url$query <- list(classKey = 'DATA_ELEMENT')
  response <- httr::POST(
    url = httr::build_url(csv_upload_url),
    body = list(file = httr::upload_file('csv_data_no_header_delete_me.csv')),
    httr::add_headers('Content-Type' = 'application/csv'),
    httr::authenticate(dhis2_username,
                       dhis2_password)
  )
  response_json <-
    jsonlite::fromJSON(httr::content(response, 'text'))
  response_json
}
```

You can run the function with e.g.:

```r
new_data_elements(csv_file_location,
                  dhis2_base_url,
                  dhis2_username,
                  dhis2_password)
```

If it all goes as planned, you will see some output like this:

```
$responseType
[1] "ImportReport"

$status
[1] "OK"

$stats
$stats$created
[1] 11

$stats$updated
[1] 0

$stats$deleted
[1] 0

$stats$ignored
[1] 0

$stats$total
[1] 11


$typeReports
klass stats.created stats.updated stats.deleted stats.ignored stats.total objectReports
1 org.hisp.dhis.dataelement.DataElement            11             0             0             0          11          NULL
```

From the above we can see that our data elements were successfully created.

So far so easy. Where it gets a bit more complicated is when you change your mind and want to change or delete the data elements you just created, which almost inevitably happens. This is feasible via the API provided you haven't entered any data yet. If you have entered data for a data element then you have to delete the data before you can delete the data element - DHIS 2 enforces a kind of referential integrity.

Let's suppose we want to delete the data elements we just created. We haven't entered any data for them yet.

We first need to get the unique identifiers for the data elements. If we have used a unique pattern in the names of our data elements then we can use the R function below to search for those elements and their identifiers.

```r
get_data_element_ids <- function(pattern,
                                 dhis2_base_url,
                                 dhis2_username,
                                 dhis2_password) {
  de_url <- httr::parse_url(dhis2_base_url)
  de_url$path <-
    paste0(de_url$path, '/api/dataElements.json')
  de_url$query <- list(fields = 'id,name,displayName',
                       filter = paste0('name:ilike:', pattern))
  response <- httr::GET(httr::build_url(de_url),
                        httr::authenticate(dhis2_username,
                                           dhis2_password))
  response_list <- httr::content(response, 'parsed')$dataElements
  result <- list(
    name = sapply(response_list, `[[`, 1),
    id = sapply(response_list, `[[`, 2),
    displayName = sapply(response_list, `[[`, 3)
  )
  result
}
```

You can run this with e.g.:

```r
de_ids <- get_data_element_ids('COVID-trz',
                               dhis2_base_url,
                               dhis2_username,
                               dhis2_password)
```

It returns a nested list (here `de_ids`) with the names of the data elements (`name`) and the identifiers (`id`).

Now we need an R function to delete a data element given the identifier. Here it is:

```r
delete_data_element <- function(id,
                                dhis2_base_url,
                                dhis2_username,
                                dhis2_password) {
  delete_url <- httr::parse_url(dhis2_base_url)
  delete_url$path <-
    paste0(delete_url$path, '/api/dataElements/', id)
  response <- httr::DELETE(
    url = httr::build_url(delete_url),
    httr::authenticate(dhis2_username,
                       dhis2_password)
  )
  response_json <-
    jsonlite::fromJSON(httr::content(response, 'text'))
  print(response_json)
}
```

To delete one data element would require:

```r
delete_data_element('klolckrNchk', dhis2_base_url, dhis2_username, dhis2_password)
```

But as we already have a list of the identifiers for the data elements that are to be deleted, we can use a loop or (better) the `mapply` function, which helpfully allows us to run a function many times when some but not all of the arguments need to change each time and (also helpfully) constructs the outputs of the function into a nice list.

```r
mapply(
  delete_data_element,  # The function
  de_ids$id,  # The argument that is looped through
  MoreArgs = list(dhis2_base_url,  # This is where we specify the arguments that do not change
                  dhis2_username,
                  dhis2_password)
)
```

As it loops through the identifiers, you will hopefully see lots of output like this, indicating success:

```
$httpStatus
[1] "OK"

$httpStatusCode
[1] 200

$status
[1] "OK"

$response
$response$responseType
[1] "ObjectReport"

$response$uid
[1] "xhLfD2x8Ol9"

$response$klass
[1] "org.hisp.dhis.dataelement.DataElement"

$response$errorReports
list()
```

All being well, you can run the search function again (`get_data_element_ids`) and it will return an empty list, i.e.:

```
$name
list()

$id
list()

$displayName
list()
```

Now you would think you could now run the data element upload code again to recreate the data elements (after any changes you want to make to the CSV file). But you haven't deleted everything that was created by your last upload yet, so will get an error when you try:

```
$responseType
[1] "ImportReport"

$stats
$stats$created
[1] 0

$stats$updated
[1] 0

$stats$deleted
[1] 0

$stats$ignored
[1] 11

$stats$total
[1] 11


$typeReports
                                  klass stats.created stats.updated stats.deleted stats.ignored stats.total
1 org.hisp.dhis.dataelement.DataElement             0             0             0            11          11
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         objectReports
1 org.hisp.dhis.dataelement.DataElement, org.hisp.dhis.dataelement.DataElement, 0, 1, JBftEAsD8mY, EpSVKIizFKk, Property `name` with value `Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv"` on object Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv" [JBftEAsD8mY] (DataElement) already exists on object hiaiAM6JcGh., Property `shortName` with value `Content-Disposition: attachment; name="file"; file` on object Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv" [JBftEAsD8mY] (DataElement) already exists on object hiaiAM6JcGh., org.hisp.dhis.dataelement.DataElement, org.hisp.dhis.dataelement.DataElement, E5003, E5003, hiaiAM6JcGh, hiaiAM6JcGh, name, shortName, name, Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv", Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv" [JBftEAsD8mY] (DataElement), hiaiAM6JcGh, shortName, Content-Disposition: attachment; name="file"; file, Content-Disposition: attachment; name="file"; filename="csv_data_no_header_delete_me.csv" [JBftEAsD8mY] (DataElement), hiaiAM6JcGh, Property `name` with value `Content-Type: text/csv` on object Content-Type: text/csv [EpSVKIizFKk] (DataElement) already exists on object XPlR3OcauPV., Property `shortName` with value `Content-Type: text/csv` on object Content-Type: text/csv [EpSVKIizFKk] (DataElement) already exists on object XPlR3OcauPV., org.hisp.dhis.dataelement.DataElement, org.hisp.dhis.dataelement.DataElement, E5003, E5003, XPlR3OcauPV, XPlR3OcauPV, name, shortName, name, Content-Type: text/csv, Content-Type: text/csv [EpSVKIizFKk] (DataElement), XPlR3OcauPV, shortName, Content-Type: text/csv, Content-Type: text/csv [EpSVKIizFKk] (DataElement), XPlR3OcauPV

$status
[1] "ERROR"
```

There are two identifiers shown in the error message (here "hiaiAM6JcGh" and "XPlR3OcauPV"; ignore any in square brackets) which you need to delete with the `delete_data_element` function before you can successfully reupload your CSV file.

After that you are done and can continue to configure things in the Web interface.

