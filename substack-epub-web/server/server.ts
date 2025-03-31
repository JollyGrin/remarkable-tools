// Load environment variables
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createEpub } from './epub-converter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileToUploadThing } from './uploadthing-config.js';

// Check if UploadThing token exists
if (!process.env.UPLOADTHING_TOKEN) {
  console.warn('WARNING: UPLOADTHING_TOKEN environment variable not found. UploadThing integration will not work.');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads and output directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/output', express.static(outputDir));

// Routes
app.post('/api/convert', async (req, res) => {
  try {
    const { substackName } = req.body;
    
    if (!substackName) {
      return res.status(400).json({ error: 'Substack name is required' });
    }

    console.log(`Processing substack: ${substackName}`);
    
    // Convert feed to EPUB
    const { mdFilePath, epubFilePath } = await createEpub(substackName, outputDir);
    
    // Construct local download URL (fallback)
    const epubFileName = path.basename(epubFilePath);
    const localDownloadUrl = `/output/${epubFileName}`;
    
    // Try to upload to UploadThing if token exists
    let uploadResult = null;
    if (process.env.UPLOADTHING_TOKEN) {
      try {
        console.log('Uploading EPUB file to UploadThing...');
        uploadResult = await uploadFileToUploadThing(epubFilePath, epubFileName);
        console.log('Upload successful:', uploadResult);
      } catch (uploadError) {
        console.error('Error uploading to UploadThing:', uploadError);
        console.log('Falling back to local file serving');
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Conversion successful',
      fileName: epubFileName,
      // If upload was successful, return the UploadThing URL, otherwise fallback to local URL
      downloadUrl: uploadResult?.fileUrl || localDownloadUrl,
      // Include both URLs for flexibility
      uploadThingUrl: uploadResult?.fileUrl || null,
      localDownloadUrl,
      // Include additional metadata from UploadThing if available
      uploadMetadata: uploadResult || null
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Failed to convert feed to EPUB', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
