+++
title = "`deef`: a Shiny app"
+++

Nearly 10 years ago I was faced with the challenge of routinely collecting personally-identifiable data on TB cases from clinicians across my region. I created a form in Microsoft Word and some code (ultimately a Shiny app) to extract the data from a batch of forms (sent via secure email), which involved getting my head around XML and XPath queries. This process worked surprisingly well for several years, and I automated much of the analysis too. I even Dockerised the Shiny app at one point and tried to deploy it on our internal OpenShift platform (ultimately stymied by a non-functioning GitLab Runner). For fun (only) I deployed the app on my CapRover PaaS. It was my first real Shiny app and I did want to develop it further to tidy up the code and the user interface and capture more types of form field, but version 2 never progressed very far due to increasing competing demands on my time. Eventually the national surveillance data collection system was upgraded to capture the same data and we switched to using that instead.

I had shared the app code with other interested teams in my organisation but only recently became aware that one of our national teams was still using it (in combination with Word macros), when someone did a stocktake of survey solutions we use. I was as surprised as I was gratified. It is likely to be replaced with a better process for us, but as it could still have applications where offline form-based data collection is the only option, I thought I would add it to the blog, as is. 

The GitHub repo is here: [Paul Cleary / deef · GitLab](https://gitlab.phe.gov.uk/Paul.Cleary/deef) - you can run it from GitHub without cloning. The version I deployed to CapRover is here (it includes the Shiny code as a Git submodule): [prcleary/caprover-deef: Shiny app](https://github.com/prcleary/caprover-deef). The rest of the information below is from the README file and the main code files. 

## README

`deef` is a data extractor for electronic forms, compatible with Microsoft Word 
files with name ending `.docx` and/or `.docm`, i.e. compatible with Microsoft Office 2007 and later.

It is a work in progress. Please log any issues in this project. For any other queries drop [me](mailto:paul.cleary@phe.gov.uk?Subject=deef) an email.

It allows you to load and extract form field data from a batch of `.docx` and/or `.docm` files 
which contain certain *legacy* electronic form fields:

- Text Form Fields 
- Check Box Form Fields
- Drop-Down Form Fields

See illustration for where to find these in the Word "ribbon". 

See also this helpful YouTube clip for more information on using legacy form fields in Microsoft Word: <https://www.youtube.com/watch?v=rCjVKZcXMP0>

![Compatible widgets](https://github.com/prcleary/deef/raw/master/img/widgets.png)

The questionnaire needs to be "protected" before use; otherwise the fields can be overwritten. You first need to make the Developer tab visible on the Ribbon as shown below, using Word Options:

![Word options](https://github.com/prcleary/deef/raw/master/img/protection.png)

Then you can protect the document thus: 

![Protecting the form](https://github.com/prcleary/deef/raw/master/img/protection2.png)

You don’t need to set a password (just leave the password fields blank and click Ok). 

Finally save the form. 

Limitation: Text Form Field data extracted may include other text in the same paragraph as the content control, so it is safest to use a table to structure your questionnaire and to put each content control in a separate cell, without any following text in the same cell. 

Data can be copied to the clipboard or downloaded from the app as CSV or Microsoft Excel files. 

The following packages must be installed:

- `data.table`
- `DT`
- `shiny`
- `XML`
- `xml2`

You can install all dependencies with:

``` r
install.packages(c('data.table', 'DT', 'shiny', 'XML', 'xml2'), dependencies = TRUE)
```

You can easily run the app on your own machine with a single command if you have R, RStudio and the above packages installed.

``` r
shiny::runUrl('https://github.com/prcleary/deef/archive/refs/heads/master.zip')
```

You can also use the extraction function in your own code - see <https://gist.github.com/prcleary/c7f4dcbd9226c491ee53161ad7f88cef>.

You can also run it in a Docker container - see enclosed Dockerfile.

**TODO**

- [ ] Rebuild based on Shiny modules to make it extensible
- [ ] Use a better-looking framework such as [`shiny.fluent`](https://appsilon.github.io/shiny.fluent/index.html
- [ ] Make the app available online via UKHSA OpenShift

## `fixUploadedFilesNames.r`

This was a hack which may no longer be necessary. All code was written before I started using RStudio so R code filenames variably end in `.r` or `.R`. 

```r
fixUploadedFilesNames <- function(x) {
  
  # rename uploaded files to real filenames
  # from http://tinyurl.com/nxcqluf
  
  if (is.null(x)) {
    return()
  }
  
  oldNames = x$datapath
  newNames = file.path(dirname(x$datapath),
                       x$name)
  file.rename(from = oldNames, to = newNames)
  x$datapath <- newNames
  x
}
```

## `get_ffData.r`

This is the main function for extracting data from form fields. As soon as it did what I needed I stopped developing it. It can be used independently of the Shiny app. 

```r
# TODO check how deals with odd character encoding
# TODO get merge fields

get_ffData <- function(filepath,
                       verbose=FALSE) {
  
  # NB: only looks for legacy form fields currently
  # (others ignored)
  # NB: each form field must be in own table cell
  
  require(XML)
  require(xml2)  # Use only xpath (1.0) expressions
  
  if (!file.exists(filepath)) stop('File ', filepath,
  ' not found. Try changing working directory or giving full path.')
  
  if (verbose) message('Reading file: ', filepath)
  
  unzipped <- unzip(filepath, 'word/document.xml')
  doc_xml <- read_xml(unzipped)
  
  ffData_nodeset <- xml_find_all(doc_xml, './/w:ffData')
  num_ffData_nodes <- xml_length(ffData_nodeset)
  num_ffData <- length(num_ffData_nodes)
  
  if (length(num_ffData_nodes) > 1 && num_ffData_nodes[1] > 0) {
    
    ffData_results <- data.frame(
      name = rep(NA_character_, num_ffData),
      result = rep(NA_character_, num_ffData),
      stringsAsFactors = FALSE
    )
    
    for (i in 1:num_ffData) {
      
      if (verbose) message('Processing form field ', i)
      
      result <- NULL
      
      # Get names 
      # form field names in `name` node in `ffData` node
  
      ffData_node <- ffData_nodeset[i]
      name_node <- xml_find_first(ffData_node,
                                  './/w:name')
      name <- xml_attr(name_node, 'val')
      
      if (verbose) message('Name is ', name, ', ',
                           appendLF = FALSE)  
      ffData_results[i, 'name'] <- name
      
      # Look for nodes with results 
      
      # checkBox result is presence/absence of `checked` node 
      # downtree of `checkBox` node downtree of `ffData` node
      # val of checked is NA if checked, 0 if unchecked
      # checked is missing if default
      
      checkBox_node <- xml_find_first(ffData_node,
                                      './/w:checkBox')
      if (!is.na(xml_text(checkBox_node))) {
        
        checked <- xml_find_first(checkBox_node,
                                  './/w:checked')
        if (!is.na(xml_text(checked))) {  
          
          result <- ifelse(xml_attr(checked, 'val') %in% '0', 
                           '0', 
                           '1')
          
        } else {
          
          result <- '0'
          
        }
        
      }  
      
      # dropdown result is `result` node 
      # downtree of `ddList` node downtree of `ffData` node
      # NA if default selected
      
      ddList_node <- xml_find_first(ffData_node,
                                    './/w:ddList')
      
      if (!is.na(xml_text(ddList_node))) {  
        
        result_node <- xml_find_first(ddList_node, './/w:result')
        ddList_option_nodes <- xml_find_all(ddList_node,
                                       './/w:listEntry')
        ddList_options <- xml_attr(ddList_option_nodes,
                                   'val')
        result_index <- xml_attr(result_node, 'val')
        if (is.na(result_index)) {  
          
          result_index <- NULL
          result_index <- 1
          
        } else {
          
          # Deal with zero-based indexing
          result_index <- as.numeric(result_index) + 1
          
        }
        
        result <- ddList_options[result_index]
        
      }    
      
      textInput_node <- xml_find_first(ffData_node,
                                       './/w:textInput')
      
      if (!is.na(xml_text(textInput_node))) {
        
        # Select innermost containing paragraph
        # relative to `ffData_node`
        parent_para <- xml_find_first(textInput_node,
                                      "./ancestor::w:p")
        
        # Get `textInput` run
        textInput_run <- xml_find_first(textInput_node,
                                        "./ancestor::w:r")
         
        # Get remaining parent paragraph runs
        parent_para_runs <-
          xml_find_all(textInput_run, 
                       'following-sibling::w:r')
        
        # Get text from remaining following runs in parent paragraph
        parent_para_t <- xml_find_all(parent_para_runs,
                                      './/w:t')
        
        # Find all paragraphs that are following siblings
        following_para <-
          xml_find_all(parent_para,
                       "following-sibling::w:p")
        
        # Find all runs in those paragraphs
        following_para_runs <-
          xml_find_all(following_para,
                       "w:r")
        
        # Get text from runs in following paragraphs
        following_para_t <-
          xml_find_all(following_para_runs,
                       './/w:t')
        
        result <- paste0(c(xml_text(parent_para_t), 
                           xml_text(following_para_t)), 
                         collapse = '')
        
        result <-
          gsub("\\s+", " ", str_trim(result))
        
      }
      
      if (verbose) message('Result is ', result)
      
      if (exists('result')) {
        ffData_results[i, 'result'] <- result
        
      }
      
    }
    
    ffData_results <- rbind(ffData_results,
                            c('filename', basename(filepath)))
    n <- ffData_results$name
    transposed <- as.data.frame(t(ffData_results[,-1]))
    colnames(transposed) <- n
    
    data.frame(lapply(transposed, as.character),
               stringsAsFactors=FALSE)
    
  } else {
    
    message('No form fields found in ', filepath)
    
    data.frame(stringsAsFactors=FALSE)
    
  }
  
}
```

## `global.r`

```r
library(data.table)
library(DT)
library(shiny)
library(stringr)
library(XML)
library(xml2)

source('fixUploadedFilesNames.r')
source('get_ffData.r')

# Hide `structure` error (bug in DT)
# https://github.com/rstudio/shiny/issues/1682
options(warn=-1)
```

## `server.R`

```r
shinyServer(function(input, output) {
  
  cat('Server starting\n')
  
  wordfiles <- reactive(fixUploadedFilesNames(input$wordfiles))
  
  observe({
    validate(
      need(!is.null(wordfiles()$datapath),
                    'No files uploaded'))
  })
  
  output$wordfiles <- renderDataTable({ 
    wordfiles()
    })
  
  formdata <- reactive({     
    
    if (input$verbose) cat('\n', paste(wordfiles()$datapath, '\n'))
    datalist <- lapply(as.list(wordfiles()$datapath),  
                       function(x) get_ffData(x, verbose=input$verbose))  
    output <- rbindlist(datalist, use.names=TRUE, fill=TRUE) 
    row.names(output) <- NULL
    output
  })
  
  output$formdata <- DT::renderDataTable({   
    formdata() 
    },  extensions = 'Buttons',  
    options = list(   
      dom = 'Bfrtip',   
      buttons = c('copy',  
                  'excel', 
                  'csv' 
                  )),
    server=FALSE)
  
})
```

## `ui.R`

A clunky, minimal-effort user interface

```r
shinyUI(fluidPage(
  
  titlePanel('deef (data extractor for electronic forms)',
             'deef'),
  
  tags$p('Compatible with Microsoft Word files with file name ending .docx'),
  
  tags$a('GitHub project page', href='https://github.com/prcleary/deef', target='_blank>'),
  
  tags$p(),
  
  fileInput(
    'wordfiles',
    label=NULL,
    multiple = TRUE,
    accept = c(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.macroEnabled.12'
    ),
    width = '30%',
    buttonLabel = "Click here",
    placeholder = "No file selected"
  ),
  
  checkboxInput('verbose', 
                label='Print details to console (when run locally)', 
                value=FALSE
  ),
  
  tags$h2('Files uploaded'),
  
  dataTableOutput('wordfiles'),   
  
  tags$h2('Data extracted'),
  
  dataTableOutput('formdata')
 
))
```

##  Script for batch extraction of data from Microsoft Word forms, using function from deef Shiny app 

See code comments for instructions

```r
# Save this script in a directory containing "input" and "output" directories. 
# Open script in RStudio and make sure working directory is where script is.
 
# Packages required - install if needed
library(data.table)
library(stringr)
library(XML)
library(xml2)

# Directory containing forms
inputdir <- 'input'

# Directory for data extracted
outputdir <- 'output'

# Obtain key function from deef tool
source('https://gitlab.phe.gov.uk/Paul.Cleary/deef/raw/master/get_ffData.r')

# Get list of file paths
filepaths <- list.files(inputdir, full.names=TRUE, pattern='\\.docx$')
if (length(filepaths)==0) stop('No docx files found')

# Iterate through files
datalist <- lapply(filepaths, function(x) get_ffData(x))  
output <- rbindlist(datalist, use.names=TRUE, fill=TRUE) 
row.names(output) <- NULL

# Save output 
write.csv(output, 
  file=file.path(outputdir, paste(Sys.Date(), 'output.csv', sep='')),
  row.names=FALSE)
```

Shiny app development could be quite time-consuming, but now that ChatGPT, [Shiny Assistant](https://shiny.posit.co/blog/posts/shiny-assistant/) and similar tools can speed up the development process I've started seeing more potential uses.  


