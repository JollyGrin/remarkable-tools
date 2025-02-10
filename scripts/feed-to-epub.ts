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

  // Take only the first 50 items
  const recentItems = items.slice(0, 50);

  let markdown = `# ${substackName} Articles\n\n`;

  for (const item of items) {
    const title = decode(item.title);
    const date = new Date(item.pubDate).toISOString().split("T")[0];
    const content = item["content:encoded"] || item.description || "";

    // Convert HTML content to Markdown and clean up any extra whitespace
    const mdContent = marked
      .parse(content)
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim();

    markdown += `# ${title}\n\n`; // Using h1 for chapter-level breaks in EPUB
    markdown += `*Published on ${date}*\n\n`;
    markdown += `${mdContent}\n\n`;
  }

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
