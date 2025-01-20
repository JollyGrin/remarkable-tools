Title: USB Web Interface

URL Source: https://remarkable.guide/tech/usb-web-interface.html

Markdown Content:
There is an optional web interface that can be turned on that allows you upload and export files from the device.

Contents

*   [Enable the interface](https://remarkable.guide/tech/usb-web-interface.html#enable-the-interface)
    
*   [API](https://remarkable.guide/tech/usb-web-interface.html#api)
    
    *   [`POST http://10.11.99.1/documents/`](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-documents)
        
    *   [`POST http://10.11.99.1/documents/{guid}`](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-documents-guid)
        
    *   [`GET http://10.11.99.1/download/{guid}/placeholder`](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-download-guid-placeholder)
        
    *   [`GET http://10.11.99.1/download/{guid}/rmdoc`](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-download-guid-rmdoc)
        
    *   [`POST http://10.11.99.1/upload`](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-upload)
        
    *   [`GET http://10.11.99.1/log.txt`](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-log-txt)
        
*   [External links](https://remarkable.guide/tech/usb-web-interface.html#external-links)
    

API[#](https://remarkable.guide/tech/usb-web-interface.html#api "Link to this heading")
---------------------------------------------------------------------------------------

The USB Web Interface exposes the following API endpoints that can be used to interact with the xochitl filesystem.

### `POST http://10.11.99.1/documents/`[#](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-documents "Link to this heading")

Get the document and folders list for the root folder.

**Example:**

curl \\
  \--silent \\
  http://10.11.99.1/documents/ \\
| jq \-r 'map({(.ID): {VissibleName,Type}}) | add'

### `POST http://10.11.99.1/documents/{guid}`[#](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-documents-guid "Link to this heading")

Get the documents and folders list for a specific folder.

**Example:**

guid\=fd2c4b2c-3849-46c3-bf2d-9c80994cc985
curl \\
  \--silent \\
  "http://10.11.99.1/documents/$guid" \\
| jq \-r 'map({(.ID): {VissibleName,Type}}) | add'

### `GET http://10.11.99.1/download/{guid}/placeholder`[#](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-download-guid-placeholder "Link to this heading")

Download the PDF for a specific document.

**Example:**

guid\=fd2c4b2c-3849-46c3-bf2d-9c80994cc985
curl \\
  \-I "http://10.11.99.1/download/$guid/placeholder"

### `GET http://10.11.99.1/download/{guid}/rmdoc`[#](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-download-guid-rmdoc "Link to this heading")

Download the raw notebook archive for a specific document. This was added in v3.9.

**Example:**

guid\=fd2c4b2c-3849-46c3-bf2d-9c80994cc985
curl \\
  \-I "http://10.11.99.1/download/$guid/rmdoc"

### `POST http://10.11.99.1/upload`[#](https://remarkable.guide/tech/usb-web-interface.html#post-http-10-11-99-1-upload "Link to this heading")

Upload a document to the last folder that was listed.

**Example:**

file\=Get\_started\_with\_reMarkable.pdf
curl \\
  'http://10.11.99.1/upload' \\
  \-H 'Origin: http://10.11.99.1' \\
  \-H 'Accept: \*/\*' \\
  \-H 'Referer: http://10.11.99.1/' \\
  \-H 'Connection: keep-alive' \\
  \-F "file=@$file;filename=$(basename "$file");type=application/pdf"

### `GET http://10.11.99.1/log.txt`[#](https://remarkable.guide/tech/usb-web-interface.html#get-http-10-11-99-1-log-txt "Link to this heading")

Download the xochitl log file found at `/home/root/log.txt`.

**Example:**

curl \\
  \--silent \\
  \--remote-name \\
  \--remote-header-name \\
  'http://10.11.99.1/log.txt'

