import { XMLParser } from 'fast-xml-parser';
import { marked } from 'marked';
import { writeFileSync } from 'fs';
import { decode } from 'html-entities';

async function fetchAndParseFeed() {
    const response = await fetch('https://graymirror.substack.com/feed');
    const xmlData = await response.text();
    
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    
    const feed = parser.parse(xmlData);
    const items = feed.rss.channel.item;
    
    // Take only the first 20 items
    const recentItems = items.slice(0, 20);
    
    let markdown = '# Gray Mirror Articles\n\n';
    
    for (const item of recentItems) {
        const title = decode(item.title);
        const date = new Date(item.pubDate).toISOString().split('T')[0];
        const content = item['content:encoded'] || item.description || '';
        
        // Convert HTML content to Markdown and clean up any extra whitespace
        const mdContent = marked.parse(content)
            .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newlines
            .trim();
        
        markdown += `\n\\pagebreak\n\n`;  // Add page break before each article
        markdown += `## ${title}\n`;
        markdown += `*Published on ${date}*\n\n`;
        markdown += `${mdContent}\n\n`;
        markdown += `---\n\n`;
    }
    
    writeFileSync('gray-mirror-articles.md', markdown);
    console.log('Successfully created gray-mirror-articles.md');
}

fetchAndParseFeed().catch(console.error);
