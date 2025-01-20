import { mdToPdf } from 'md-to-pdf';
import { readFileSync } from 'fs';

async function convertToPdf() {
    const markdown = readFileSync('gray-mirror-articles.md', 'utf-8');
    
    await mdToPdf(
        { content: markdown },
        {
            dest: 'gray-mirror-articles.pdf',
            stylesheet: `
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                h1 { color: #333; }
                h2 { color: #444; margin-top: 2em; }
                hr { margin: 2em 0; }
                img { max-width: 100%; height: auto; }
            `
        }
    );
    
    console.log('Successfully created gray-mirror-articles.pdf');
}

convertToPdf().catch(console.error);
