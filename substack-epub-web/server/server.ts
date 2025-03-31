import express from 'express';
import cors from 'cors';
import { createEpub } from './epub-converter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    
    // Construct download URL
    const epubFileName = path.basename(epubFilePath);
    const downloadUrl = `/output/${epubFileName}`;
    
    res.json({ 
      success: true, 
      message: 'Conversion successful',
      downloadUrl,
      fileName: epubFileName
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Failed to convert feed to EPUB', 
      details: error.message 
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
