+++
title = "Convenience R functions for querying the SENAITE API"
+++

Developed these R functions to query the SENAITE API and to put the data into a more manageable format

- `get_senaite_data` can query data or metadata from any endpoint, specifying parameters
- `download_senaite_report` will download a PDF lab report given the URL and expected file name
- `view_senaite_output` views the data in an easier format for viewing
- `flatten_senaite_output` converts the data to an easier format for analysis

Dependencies: `cli`, `httr`, `keyring` (make sure to save your `senaite_username` and `senaite_password` secrets before running these functions), `tibble`, `tidyr`

```r
# functions.R

# Plone API: [plone.jsonapi.routes — plone.jsonapi.routes 0.9.3 documentation](https://plonejsonapiroutes.readthedocs.io/en/latest/index.html)
# SENAITE API: [senaite.jsonapi — senaite.jsonapi 1.2.5 documentation](https://senaitejsonapi.readthedocs.io/en/latest/index.html)

construct_senaite_url <- function(base_url, endpoint, params = list()) {
  base_url <- sub('/$', '', base_url)
  endpoint <- sub('^/', '', endpoint)
  api_url <- paste0(base_url, '/@@API/senaite/v1/', endpoint)
  if (length(params) > 0) {
    query_string <- paste(names(params),
                          params,
                          sep = '=',
                          collapse = '&')
    api_url <- paste0(api_url, '?', query_string)
  }
  api_url
}

get_senaite_data <- function(base_url,
                             endpoint = c(
                               'analysis',
                               'analysiscategories',
                               'analysiscategory',
                               'analysisprofile',
                               'analysisprofiles',
                               'analysisrequest',
                               'analysisrequestsfolder',
                               'analysisservice',
                               'analysisservices',
                               'analysisspec',
                               'analysisspecs',
                               'antibiotic',
                               'antibioticclass',
                               'arreport',
                               'artemplate',
                               'artemplates',
                               'astpanel',
                               'astpanelfolder',
                               'attachment',
                               'attachmenttype',
                               'attachmenttypes',
                               'auditlog',
                               'autoimportlog',
                               'batch',
                               'batchfolder',
                               'batchlabel',
                               'batchlabels',
                               'bikasetup',
                               'breakpointstable',
                               'breakpointstables',
                               'calculation',
                               'calculations',
                               'catalogs',
                               'client',
                               'clientfolder',
                               'contact',
                               'samplecontainer',
                               'samplecontainers',
                               'containertype',
                               'containertypes',
                               'databox',
                               'databoxfolder',
                               'department',
                               'departments',
                               'duplicateanalysis',
                               'dynamicanalysisspec',
                               'dynamicanalysisspecs',
                               'instrument',
                               'instrumentcalibration',
                               'instrumentcertification',
                               'instrumentlocation',
                               'instrumentlocations',
                               'instrumentmaintenancetask',
                               'instruments',
                               'instrumentscheduledtask',
                               'instrumenttype',
                               'instrumenttypes',
                               'instrumentvalidation',
                               'interpretationtemplate',
                               'invoice',
                               'labcontact',
                               'labcontacts',
                               'laboratory',
                               'labproduct',
                               'labproducts',
                               'manufacturer',
                               'manufacturers',
                               'method',
                               'methods',
                               'microorganism',
                               'microorganismcategory',
                               'microorganismcategories',
                               'microorganismfolder',
                               'multifile',
                               'patient',
                               'patientfolder',
                               'plone_site',
                               'preservation',
                               'preservations',
                               'pricelist',
                               'pricelistfolder',
                               'referenceanalysis',
                               'referencedefinition',
                               'referencedefinitions',
                               'referencesample',
                               'referencesamplesfolder',
                               'reflexrule',
                               'reflexrulefolder',
                               'rejectanalysis',
                               'report',
                               'reportfolder',
                               'samplecondition',
                               'sampleconditions',
                               'samplematrices',
                               'samplematrix',
                               'samplepoint',
                               'samplepoints',
                               'sampletype',
                               'sampletypes',
                               'samplingdeviation',
                               'samplingdeviations',
                               'search',
                               'storagelocation',
                               'storagelocations',
                               'subgroup',
                               'subgroups',
                               'supplier',
                               'suppliercontact',
                               'suppliers',
                               'supplyorder',
                               'supplyorderfolder',
                               'version',
                               'worksheet',
                               'worksheetfolder',
                               'worksheettemplate',
                               'worksheettemplates',
                               'version'
                             ),
                             params = list(),
                             limit = 100,
                             verbose = TRUE) {
  if (!is.list(params))
    stop('`params` should be a list')
  params <- c(params, limit = limit)
  endpoint <- match.arg(endpoint)
  url <- construct_senaite_url(base_url, endpoint, params)
  if (verbose)
    cli::cli_alert_info('Downloading: {url}')
  response <- httr::GET(url,
                        httr::authenticate(
                          keyring::key_get('senaite_username'),
                          keyring::key_get('senaite_password')
                        ))
  output <- httr::content(response)
  if (!is.null(output$pages)) {
    n_pages <-  output$pages
    if (n_pages > 1) {
      b_start <- seq(params$limit + 1, n_pages * params$limit, params$limit)
      next_urls <- paste(url, '&b_start=', b_start, sep = '')
      next_outputs <- lapply(next_urls, function(x) {
        if (verbose)
          cli::cli_alert_info('Downloading: {x}')
        response <- httr::GET(x,
                              httr::authenticate(
                                keyring::key_get('senaite_username'),
                                keyring::key_get('senaite_password')
                              ))
        httr::content(response)
      })
      items <- unlist(c(
        list(output$items),
        lapply(next_outputs, function(x)
          x$items)
      ), recursive = FALSE)
    } else {
      items <- output$items
    }
    items

  } else {
    if (verbose)
      cli::cli_alert_warning('Not found')
    NULL
  }
}

download_senaite_report <- function(url, output_file) {
  response <- httr::GET(url,
                        httr::authenticate(
                          keyring::key_get('senaite_username'),
                          keyring::key_get('senaite_password')
                        ))
  if (httr::status_code(response) == 200) {
    writeBin(httr::content(response, 'raw'), output_file)
    cli::cli_alert_info('Download successful: {output_file}')
  } else {
    cli::cli_alert_info('Failed to download file.\nHTTP Status: {httr::status_code(response)}')
  }
}

view_senaite_output <- function(x, new_tab = TRUE) {
  senaite_output <- tibble::enframe(unlist(x))
  if (new_tab)
    View(senaite_output, 'SENAITE output')
  invisible(senaite_output)
}

flatten_senaite_output <- function(x, collapse = '➕') {
  unpacked_list <- lapply(x, function(item) {
    enframed <- tibble::enframe(unlist(item))
    enframed |> tidyr::pivot_wider(
      names_from = 'name',
      values_from = 'value',
      values_fn = \(x) paste0(x, collapse = collapse)
    )
  })
  data.table::rbindlist(unpacked_list, use.names = TRUE, fill = TRUE)
}
```

Examples for testing

```r
# paul_testing.R

source('R/functions.R')

# Examples
BASE_URL <- 'https://senaite.example.com/yourlab'

# Example 1
analysis1 <- get_senaite_data(BASE_URL,
                              endpoint = 'analysis',
                              params = list(complete = TRUE, children = TRUE))
length(analysis1) 

analysis2 <- get_senaite_data(
  BASE_URL,
  endpoint = 'analysis',
  params = list(
    complete = TRUE,
    children = TRUE,
    review_state = 'published'
  )
)
length(analysis2) 

analysis3 <- get_senaite_data(
  BASE_URL,
  endpoint = 'analysis',
  params = list(
    complete = TRUE,
    children = TRUE,
    recent_created = 'this-week'  # today, yesterday this-week, this-month, this-year; recent_modified
  )
)
length(analysis3)

sapply(analysis3, `[[`, 'title')
names(analysis3[[1]])

# Example 2
catalogs <- get_senaite_data(BASE_URL,
                             endpoint = 'catalogs',
                             params = list(complete = TRUE, children = TRUE))
sapply(catalogs, `[[`, 'id')

# Example 3
senaite_catalog_analysis <- get_senaite_data(
  BASE_URL,
  endpoint = 'search',
  params = list(
    catalog = 'senaite_catalog_analysis',
    review_state = 'published',
    sort_on = 'getDatePublished',
    # or 'getDateSampled'
    sort_order = 'desc',
    complete = TRUE,
    children = TRUE
  )
)
length(senaite_catalog_analysis)  
names(senaite_catalog_analysis[[1]])
sapply(senaite_catalog_analysis, `[[`, 'title')
sapply(senaite_catalog_analysis, `[[`, 'Result')

# Example 4
arreport <- get_senaite_data(BASE_URL,
                             endpoint = 'arreport',
                             params = list(complete = TRUE, children = TRUE))
length(arreport)
sapply(arreport, `[[`, 'Pdf')  # all lab reports
view_senaite_output(arreport)

# Example 5
download_senaite_report(
  'https://senaite.example.come/yourlab/clients/client-9/plasma-0001/arreport-1/at_download/Pdf',
  'plasma-0001.pdf'
)

# Example 6
patient <- get_senaite_data(BASE_URL,
                            endpoint = 'patient',
                            params = list(complete = TRUE, children = TRUE))
patient_output <- view_senaite_output(patient, new_tab = FALSE)
View(patient_output[patient_output$name %in% c('path', 'birthdate'), ])
flatten_senaite_output(patient)
```

You can download all your metadata with:

```r
# download_metadata.R

source('R/functions.R')

BASE_URL <- 'https://senaite.example.com/yourlab'

get_it_all <- function(x)
  get_senaite_data(BASE_URL,
                   endpoint = x,
                   params = list(complete = TRUE, children = TRUE))

metadata <- list(
  analysiscategory = get_it_all('analysiscategory'),
  analysisprofile = get_it_all('analysisprofile'),
  analysisservice = get_it_all('analysisservice'),
  analysisspec = get_it_all('analysisspec'),
  antibiotic = get_it_all('antibiotic'),
  antibioticclass = get_it_all('antibioticclass'),
  artemplate = get_it_all('artemplate'),
  bikasetup = get_it_all('bikasetup'),
  containertype = get_it_all('containertype'),
  department = get_it_all('department'),
  interpretationtemplate = get_it_all('interpretationtemplate'),
  labcontact = get_it_all('labcontact'),
  method = get_it_all('method'),
  microorganism = get_it_all('microorganism'),
  preservation = get_it_all('preservation'),
  report = get_it_all('report'),
  samplecondition = get_it_all('samplecondition'),
  samplecontainer = get_it_all('samplecontainer'),
  samplematrix = get_it_all('samplematrix'),
  sampletype = get_it_all('sampletype')
)
metadata <- lapply(metadata, flatten_senaite_output)

metadata_output <-
  openxlsx::createWorkbook(creator = 'Me',
                           title = 'SENAITE metadata',
                           category = 'Laboratory surveillance')
for (i in names(metadata)) {
  if (nrow(metadata[[i]] > 0)) {
    openxlsx::addWorksheet(metadata_output, i)
    openxlsx::writeDataTable(
      metadata_output,
      sheet = i,
      x = metadata[[i]],
      headerStyle = openxlsx::createStyle(wrapText = TRUE, halign = 'left'),
      tableStyle = 'TableStyleLight9'
    )
    openxlsx::setColWidths(
      metadata_output,
      sheet = i,
      cols = 1:ncol(metadata[[i]]),
      widths = 'auto'
    )
    openxlsx::freezePane(metadata_output, i, firstRow = TRUE)
  }
}
openxlsx::saveWorkbook(metadata_output, file = 'metadata.xlsx', overwrite = TRUE)
```

