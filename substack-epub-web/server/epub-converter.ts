import { XMLParser } from "fast-xml-parser";
import { marked } from "marked";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { decode } from "html-entities";
import { execSync } from "child_process";
import path from 'path';

export async function createEpub(substackName: string, outputDir: string = './output') {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Fetch the RSS feed
  const response = await fetch(`https://${substackName}.substack.com/feed`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }

  const xmlData = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const feed = parser.parse(xmlData);
  const items = feed.rss.channel.item;

  console.log(`Found ${items.length} articles in the feed`);

  // Take only the first 50 items
  const recentItems = items.slice(0, 50);

  let markdown = `# ${substackName} Articles\n\n`;
  let processedCount = 0;

  for (const item of recentItems) {
    const title = decode(item.title);
    const date = new Date(item.pubDate).toISOString().split("T")[0];
    const content = item["content:encoded"] || item.description || "";

    // First clean up the HTML content
    const cleanHtml = content
      .replace(/<br\s*\/?>/gi, "\n") // Convert br tags to newlines
      .replace(/<div[^>]*>/gi, "") // Remove opening div tags
      .replace(/<\/div>/gi, "\n") // Convert closing div tags to newlines
      .replace(/<p[^>]*>/gi, "") // Remove opening p tags
      .replace(/<\/p>/gi, "\n\n") // Convert closing p tags to double newlines
      .replace(/<figure[^>]*>.*?<\/figure>/gi, "") // Remove figure elements
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframe elements
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script elements
      .replace(/<style[^>]*>.*?<\/style>/gi, "") // Remove style elements
      .replace(/<[^>]*>/g, ""); // Remove any remaining HTML tags

    // Convert to Markdown and clean up
    const mdContent = marked
      .parse(cleanHtml, {
        mangle: false,
        headerIds: false,
      })
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim();

    markdown += `## ${title}\n\n`; // Using h2 for better EPUB chapter organization
    markdown += `*Published on ${date}*\n\n`;
    markdown += `${mdContent}\n\n---\n\n`; // Add separator between articles
    processedCount++;
  }

  console.log(`Processed ${processedCount} articles into markdown`);

  // Prepare file paths
  const mdFilename = `${substackName}-articles.md`;
  const epubFilename = `${substackName}-articles.epub`;
  const mdFilePath = path.join(outputDir, mdFilename);
  const epubFilePath = path.join(outputDir, epubFilename);
  
  // Create metadata file
  const metadataPath = path.join(outputDir, 'epub-metadata.yaml');
  const metadata = `---
title: ${substackName} Articles
author: ${substackName}
date: ${new Date().toISOString().split('T')[0]}
---`;
  
  writeFileSync(metadataPath, metadata);

  // Write the markdown file
  writeFileSync(mdFilePath, markdown);
  console.log(`Successfully created ${mdFilePath}`);

  // Convert to EPUB using pandoc
  try {
    execSync(
      `pandoc ${mdFilePath} -o ${epubFilePath} --epub-metadata=${metadataPath} --toc --toc-depth=2`,
      { stdio: "inherit" },
    );
    console.log(`Successfully created ${epubFilePath}`);
    
    return { mdFilePath, epubFilePath };
  } catch (error) {
    console.error("Error creating EPUB:", error);
    throw new Error(`Error creating EPUB: ${error.message}`);
  }
}
