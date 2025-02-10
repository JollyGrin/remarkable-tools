import { XMLParser } from "fast-xml-parser";
import { marked } from "marked";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { decode } from "html-entities";
import { execSync } from "child_process";
import { createInterface } from "readline";

async function promptForSubstack(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      'Enter the Substack name (e.g., "graymirror" for graymirror.substack.com): ',
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });
}

async function fetchAndCreateEpub() {
  // Get substack name from command line or prompt
  let substackName = process.argv[2];
  if (!substackName) {
    substackName = await promptForSubstack();
  }

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
        sanitize: true
      })
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim();

    markdown += `## ${title}\n\n`; // Using h2 for better EPUB chapter organization
    markdown += `*Published on ${date}*\n\n`;
    markdown += `${mdContent}\n\n---\n\n`; // Add separator between articles
    processedCount++;
  }

  console.log(`Processed ${processedCount} articles into markdown`);

  // Ensure export directory exists
  const exportDir = "./export";
  if (!existsSync(exportDir)) {
    mkdirSync(exportDir);
  }

  // Write the markdown file
  const mdFilename = `${exportDir}/${substackName}-articles.md`;
  const epubFilename = `${exportDir}/${substackName}-articles.epub`;

  writeFileSync(mdFilename, markdown);
  console.log(`Successfully created ${mdFilename}`);

  // Convert to EPUB using pandoc
  try {
    execSync(
      `pandoc ${mdFilename} -o ${epubFilename} --epub-metadata=epub-metadata.yaml --toc --toc-depth=2`,
      { stdio: "inherit" },
    );
    console.log(`Successfully created ${epubFilename}`);
  } catch (error) {
    console.error("Error creating EPUB:", error);
  }
}

fetchAndCreateEpub().catch(console.error);
