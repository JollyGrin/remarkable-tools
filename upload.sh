#!/bin/bash

# Check if a file argument was provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <file_to_upload>"
    echo "Example: $0 document.pdf"
    exit 1
fi

# Store the file path
file="$1"

# Check if file exists
if [ ! -f "$file" ]; then
    echo "Error: File '$file' not found!"
    exit 1
fi

# Check if file is readable
if [ ! -r "$file" ]; then
    echo "Error: Cannot read file '$file'!"
    exit 1
fi

# Check if the file is a PDF
if [[ ! $(file -b --mime-type "$file") == "application/pdf" ]]; then
    echo "Warning: File may not be a PDF. Upload might fail."
fi

# Upload file using curl
echo "Uploading $file..."
curl -X POST \
    "http://10.11.99.1/upload" \
    -H "Origin: http://10.11.99.1" \
    -H "Accept: */*" \
    -H "Referer: http://10.11.99.1/" \
    -H "Connection: keep-alive" \
    -F "file=@$file;filename=$(basename "$file");type=application/pdf" \
    -w "\nHTTP Response Code: %{http_code}\n"

if [ $? -eq 0 ]; then
    echo "Upload complete!"
else
    echo "Upload failed!"
    exit 1
fi
