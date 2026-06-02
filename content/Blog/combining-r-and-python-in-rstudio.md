---
title: Combining R with Python
date: 2023-03-29
tags:
  - R
  - Python
---

Python seems a bit more flexible in terms of data structures. While of course you can create and use complex data structures in R, it might take more code than it would in Python. On the other hand some things are easier in R, so you might want to use both R and Python, and then of course you would like to be able to use both languages in the same development environment.

RStudio with the `reticulate` package now makes this much easier than I had expected. I had written a Python function to parse custom metadata from Word and Excel documents (as a proof of principle - we are wondering if we can use this for flagging files that have a retention period). But I wanted everything to be usable by monolingual R users.

You can create custom metadata in Word or Excel in a few clicks: File -> Info -> Properties -> Advanced Properties -> Custom tab (enter something in the Name and Value fields then click Add; you can have Text, Date, Number or Yes/No custom fields).
But how do you get at that data with R or Python?

A Word (.docx) or Excel (.xlsx) file is just a zip file containing various folders and XML files.
If you unzip one of these files, you can find any custom metadata in a file called `custom.xml` in a folder called `docProps`.
(If no custom metadata has been added then the `custom.xml` file may not exist.)
The `custom.xml` file contains data in XML format, a nested format with tags, similar in appearance to HTML.
Both R and Python have various add-on libraries for handling XML data.
I have used both and now have a slight preference for Python.

The Python function I created unzips the file, checks for the existence of a `custom.xml` file and (if it finds one) reads it and then parses its contents, populating a dictionary (a bit like a named list in R) with the names and values of any custom metadata found. As some files may be corrupt or not valid for some reason, it also returns some information on whether custom fields were found or not and whether it was possible or not to parse the file.

```python
# python/get_custom_metadata.py

import lxml
import lxml.etree
import zipfile

def get_custom_metadata(docpath):
  name_to_value = {}
  name_to_value['file'] = docpath
  try:
    doc_zip = zipfile.ZipFile(docpath)
    if 'docProps/custom.xml' in doc_zip.namelist():
      with doc_zip.open('docProps/custom.xml') as xml_handle:
        xml = lxml.etree.parse(xml_handle)
      root = xml.getroot()
      for element in root:
        name_to_value[element.attrib['name']] = element[0].text
      name_to_value['status'] = 'Parsed custom fields'
    else:
      name_to_value['status'] = 'No custom fields'
  except:
    name_to_value['status'] = 'Failed to parse'
  return name_to_value
```

I was then able to use the `reticulate` package to create a setup script to allow non-Python users to use my Python function.
Of course first of all you need Python, but most R users won't have that.
The `reticulate` package provides an `install_python` function which worked really well for me.
I had to uninstall my existing Python installation, as this was causing issues when I installed Python packages, but I understand it is possible to use separate Python virtual environments and existing Python installations.
You can install Python packages with `py_install` - it defaults to conda but you can use pip instead.
There is a handy `py_available` function that can check if a package is installed and available.
You can update installed Python packages with `conda_update`.
You can source a Python function with `source_python` and can then use it just like it was an R function.

This is what I ended up with as a setup script; you only have to run it once per session (it might take a while the first time):

```r
# setup.R
# Script to set up Python for use with RStudio
# **Probably best to uninstall any Python in the Software Centre before running this**
# Run this script using the Ctrl-Shift-S keyboard combination
# Run it once per session when you need to run Python
# If anything fails, restart RStudio and re-run the whole script
# You can run this script just to update your Python packages

message('\f⌛ This may take a while the first time... ☕️ ')

message('▶️ Install missing R dependencies')
r_dependencies <- c('reticulate', 'data.table', 'yaml')
for (pkg in r_dependencies) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg)
    library(pkg, character.only = TRUE)
  } else {
    library(pkg, character.only = TRUE)
  }
}
message('\f▶️ Install and initialise Python')
install_python()
py_config()
if (!py_available())
  stop('There was a problem installing Python ',
       '- try again or seek help')
message('\f▶️ Update Python packages')
conda_update()
message('\f▶️ Install missing Python dependencies')
py_install('lxml')
# py_install('', pip = TRUE)  # use if package not available from conda
if (!py_module_available('lxml'))
  stop('There was a problem installing Python dependencies ',
       '- try again or seek help',
       call. = FALSE)
message('\f▶️ Source Python functions')
python_scripts <-
  list.files('python/', pattern = '.*\\.py', full.names = TRUE)
for (i in python_scripts) {
  source_python(i)
}
message('\f▶️ Source R functions')
R_scripts <- list.files('R/', pattern = '.*\\.R', full.names = TRUE)
sapply(R_scripts, source)

message('😃 Ready to go!')
```

I wrote an R function to find Word and Excel files given the path to a directory. It will search all subdirectories too.
It will also find some of the garbage files that Word and Excel sometimes create, but the Python function can handle those.
If I had more time I would have done this in Python too, but it was just quicker to do it in R.

```r
# R/find_docx_xlsx.R
find_docx_xlsx <- function(path) {
  list.files(path,
             pattern = '.*\\.docx$|.*\\.xlsx$',
             full.names = TRUE,
             recursive = TRUE)
}
```

Finally I need a script to run all these functions.
The script below first reads a YAML config file called `config.yml` with a single field (`docpath`) containing a valid path to the directory to be searched.
Then it searches for Word and Excel files, which takes a while if there are thousands of files in that folder and its subfolders.
Then it opens and looks for a `custom.xml` file in each of those files, which also takes a while.
The Python function returns a named list to R, which is easily combined into one big table of data in `data.table`, which is then saved as CSV.

```r
# main.R

# Set up Python etc
source('setup.R')
# Get document path (saved in config/config.yml)
config <- read_yaml('config/config.yml')
# Get files (takes a while)
message('▶️ Finding Word and Excel files in ',
        config$docpath,
        ' starting at ',
        Sys.time())
files <- find_docx_xlsx(config$docpath)
# Parse files
message('▶️ Parsing files found starting at ', Sys.time())
custom_list <- lapply(files, function(x) {
  message(x)
  get_custom_metadata(x)
})
custom_fields <-
  rbindlist(lapply(custom_list, as.data.table),
            use.names = TRUE,
            fill = TRUE)
fwrite(custom_fields, 'custom_fields.csv')
message('✔️ Finished at ', Sys.time())
```

In summary, the `reticulate` package makes working with a mixture of R and Python code incredibly easy, and I wish I had used it more previously. I think I will be writing more and more Python code.



