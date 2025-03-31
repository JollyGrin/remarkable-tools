import { XMLParser } from "fast-xml-parser";
import { marked } from "marked";
import { decode } from "html-entities";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Creates an EPUB in memory from a Substack RSS feed
 */
export async function createEpubInMemory(substackName: string): Promise<{
  epubBuffer: Buffer;
  epubFileName: string;
}> {
  // Fetch the RSS feed
  console.log(`Fetching RSS feed for ${substackName}...`);
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
  const blogTitle = feed.rss.channel.title || substackName;

  console.log(`Found ${items.length} articles in the feed`);

  // Take only the first 50 items
  const recentItems = items.slice(0, 50);

  let markdown = `# ${blogTitle}\n\n`;
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
      .parse(cleanHtml)
      .toString()
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim();

    markdown += `## ${title}\n\n`; // Using h2 for better EPUB chapter organization
    markdown += `*Published on ${date}*\n\n`;
    markdown += `${mdContent}\n\n---\n\n`; // Add separator between articles
    processedCount++;
  }

  console.log(`Processed ${processedCount} articles into markdown`);

  // Generate file names for reference (no files created)
  const epubFileName = `${substackName}-articles.epub`;
  
  // Create metadata for EPUB
  const metadata = `---
title: ${blogTitle}
author: ${substackName}
date: ${new Date().toISOString().split('T')[0]}
---`;

  // Create temporary directory for pandoc processing
  const tempDir = mkdtempSync(join(tmpdir(), 'epub-'));
  const tempMdPath = join(tempDir, 'content.md');
  const tempMetadataPath = join(tempDir, 'metadata.yaml');
  const tempEpubPath = join(tempDir, epubFileName);
  
  try {
    // Write temporary files
    console.log("Writing temporary files for pandoc processing...");
    writeFileSync(tempMdPath, markdown);
    writeFileSync(tempMetadataPath, metadata);
    
    // Convert to EPUB using pandoc with temporary files
    console.log("Converting markdown to EPUB using pandoc...");
    execSync(
      `pandoc ${tempMdPath} -o ${tempEpubPath} --epub-metadata=${tempMetadataPath} --toc --toc-depth=2`,
      { stdio: "inherit" }
    );
    
    // Read the EPUB into memory
    const epubBuffer = readFileSync(tempEpubPath);
    console.log(`Successfully created EPUB in memory (${epubBuffer.length} bytes)`);
    
    return { epubBuffer, epubFileName };
  } catch (error) {
    console.error("Error creating EPUB:", error);
    throw error;
  } finally {
    // Clean up temporary files
    try {
      console.log("Cleaning up temporary files...");
      unlinkSync(tempMdPath);
      unlinkSync(tempMetadataPath);
      unlinkSync(tempEpubPath);
    } catch (cleanupError) {
      console.warn("Error cleaning up temporary files:", cleanupError);
    }
  }
}
