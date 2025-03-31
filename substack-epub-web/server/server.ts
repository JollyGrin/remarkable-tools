// Load environment variables
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileBufferToUploadThing } from './uploadthing-config.js';
import { createEpubInMemory } from './in-memory-epub.js';

// Check if UploadThing token exists
if (!process.env.UPLOADTHING_SECRET) {
  console.warn('WARNING: UPLOADTHING_SECRET environment variable not found. UploadThing integration will not work.');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/convert', async (req, res) => {
  try {
    const { substackName } = req.body;
    
    if (!substackName) {
      return res.status(400).json({ error: 'Substack name is required' });
    }

    console.log(`Processing substack: ${substackName}`);
    
    // Generate EPUB in memory
    const { epubBuffer, epubFileName } = await createEpubInMemory(substackName);
    
    // Try to upload to UploadThing
    let uploadResult = null;
    if (process.env.UPLOADTHING_SECRET) {
      try {
        console.log('Uploading EPUB file to UploadThing...');
        uploadResult = await uploadFileBufferToUploadThing(epubBuffer, epubFileName);
        console.log('Upload successful:', uploadResult);
      } catch (uploadError) {
        console.error('Error uploading to UploadThing:', uploadError);
        console.log('No fallback available - upload failed');
        return res.status(500).json({ 
          error: 'Failed to upload EPUB to UploadThing',
          details: uploadError instanceof Error ? uploadError.message : String(uploadError)
        });
      }
    } else {
      return res.status(500).json({ 
        error: 'UPLOADTHING_SECRET not configured', 
        details: 'Server is not configured with UploadThing API key'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Conversion successful',
      fileName: epubFileName,
      downloadUrl: uploadResult?.fileUrl,
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
