# Remarkable Tools

A collection of utilities for handling RSS feeds and content conversion.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh) (JavaScript runtime and package manager)
- [Pandoc](https://pandoc.org/) (for document conversions)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
bun install
```

## Scripts

The project includes several TypeScript utilities in the `scripts/` directory:

### feed-to-epub.ts
Fetches RSS feed content and converts it to EPUB format.
```bash
bun run scripts/feed-to-epub.ts
```

### feed-to-md.ts
Converts RSS feed content to Markdown format.
```bash
bun run scripts/feed-to-md.ts
```

### md-to-pdf.ts
Converts Markdown files to PDF format.
```bash
bun run scripts/md-to-pdf.ts
```

## Dependencies

This project uses several key dependencies:
- `fast-xml-parser`: For parsing RSS/XML feeds
- `marked`: For Markdown processing
- `html-entities`: For decoding HTML entities
- TypeScript: For type-safe JavaScript development

## todo
- [ ] make the scripts generic to pull from any rss feed
- [ ] make interactive .sh to run scripts in sequence and publish to remarkable

## Development

The project is built with:
- Svelte v5 (using runes)
- TypeScript
- Bun as the runtime and package manager

## Contributing

When contributing to this project, please note:
- All new code should be written in TypeScript
- Use Svelte v5 runes for component development
- Use Svelte snippets (`{#snippet}` and `{@render}`) to maintain DRY principles
