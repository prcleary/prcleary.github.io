+++
title = "Useful scripts from ChatGPT"
+++

Possibly like many nerds, I couldn't initially see past all the hype and stupidity around generative AI, but I have now managed to get ChatGPT to generate some really useful scripts recently, which I have included below, and I now realise it can be really useful if not game-changing. It sometimes took several iterations to get the working code I wanted, so there definitely has to be a human in the loop for it to be safe, but generative AI does have the potential to be quite time-saving. It is good at some things (bash or Python scripts) but not so good at others (Dockerfiles, Ansible playbooks). DeepSeek seems quite good for providing technical step-by-step guidance, though again it can take several attempts to get a correct answer. 

Here are a few scripts from ChatGPT which I have found useful. All were run on Linux. 

## Bash script to compare contents of two folders

As part of migrating data between Nextcloud instances I needed to check that two folders contained the same files before deleting one of them.

```bash
#!/bin/bash

# Usage: ./compare_dirs.sh <folder1> <folder2>
# Compares two folders recursively and outputs discrepancies.

if [ "$#" -ne 2 ]; then
	    echo "Usage: $0 <folder1> <folder2>"
	        exit 1
fi

folder1="$1"
folder2="$2"

# Check if both arguments are valid directories
if [ ! -d "$folder1" ]; then
	    echo "Error: $folder1 is not a valid directory."
	        exit 1
fi

if [ ! -d "$folder2" ]; then
	    echo "Error: $folder2 is not a valid directory."
	        exit 1
fi

# Generate lists of relative file paths for each folder
files_in_folder1=$(find "$folder1" -type f -printf "%P\n" | sort)
files_in_folder2=$(find "$folder2" -type f -printf "%P\n" | sort)

# Compare and find files only in one of the folders
echo "Files in $folder1 but not in $folder2:"
while IFS= read -r file; do
	    if ! grep -qxF "$file" <<< "$files_in_folder2"; then
		            echo "$file"
			        fi
			done <<< "$files_in_folder1"

			echo ""
			echo "Files in $folder2 but not in $folder1:"
			while IFS= read -r file; do
				    if ! grep -qxF "$file" <<< "$files_in_folder1"; then
					            echo "$file"
						        fi
						done <<< "$files_in_folder2"
```

## Renaming epub files from [Project Gutenberg](https://www.gutenberg.org/)

If like me you download lots of free ebooks from Gutenberg, you will know the file name is just a number - wouldn't it be nice if you could rename them with the title of the book?

```python
import os
import glob
import epub

dirName = "." 
#the folder containing your epub files, should be in the 
#directory which contains the script.
                  
for File in glob.glob(dirName + "\\*.epub"):
    with epub.open_epub(File) as book:
        title = book.opf.metadata.titles[0][0]

    os.rename(File, dirName + "\\" + title + ".epub")
```

## Monitoring Internet connectivity

My ageing desktop computer is connected to the router via dodgy TP Link Powerline adaptors (as the wi-fi card is even more dodgy). I wanted to see how often the network connection drops.

```python
import subprocess
import time
from datetime import datetime

def is_connected():
    """Check internet connectivity by pinging a reliable server."""
    try:
        subprocess.check_output(["ping", "-c", "1", "8.8.8.8"], stderr=subprocess.STDOUT)
        return True
    except subprocess.CalledProcessError:
        return False

def log_event(message):
    """Append a message to the log file in Markdown format."""
    with open("connection_log.md", "a") as log_file:
        log_file.write(f"{message}\n")

def main():
    was_connected = True
    start_time = None

    while True:
        if is_connected():
            if not was_connected:
                # Connection was lost and is now restored
                end_time = datetime.now()
                log_event(f"## Connection Restored\n- Start: {start_time}\n- End: {end_time}\n")
                was_connected = True
        else:
            if was_connected:
                # Connection is lost
                start_time = datetime.now()
                log_event(f"## Connection Lost\n- Start: {start_time}\n")
                was_connected = False

        time.sleep(5)  # Check every 5 seconds

if __name__ == "__main__":
    main()
```

## Decide what to do with PDF files

If like me you have a large collection of PDF files collected over years, many of which have meaningless file names, you may wish to go through them, opening each one and deciding whether to keep it.

```python
import os
import subprocess
import shutil

def open_pdf_and_manage(directory, destination_folder):
    # List all PDF files in the directory
    pdf_files = [f for f in os.listdir(directory) if f.endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in the specified directory.")
        return

    # Open each PDF file one by one
    for pdf_file in pdf_files:
        pdf_path = os.path.join(directory, pdf_file)
        
        # Open the PDF file in Document Viewer
        subprocess.run(['xdg-open', pdf_path])

        # Wait for the user to close the viewer
        input(f"Press Enter after closing the document '{pdf_file}'...")

        # Ask user if they want to delete or move the file
        action = input("Do you want to (d)elete the file or (m)ove it? (d/m): ").strip().lower()
        
        if action == 'd':
            os.remove(pdf_path)
            print(f"Deleted: {pdf_file}")
        elif action == 'm':
            if not os.path.exists(destination_folder):
                os.makedirs(destination_folder)
            shutil.move(pdf_path, os.path.join(destination_folder, pdf_file))
            print(f"Moved: {pdf_file} to {destination_folder}")
        else:
            print("Invalid option. Skipping the file.")

# Example usage
if __name__ == "__main__":
    # Set your directory and destination folder here
    directory_path = "/home/paul/pdfs_to_review"
    destination_folder = "/home/paul/pdfs_to_keep"
    
    open_pdf_and_manage(directory_path, destination_folder)
```

