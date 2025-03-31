# Substack to EPUB Web Service

This service allows you to convert Substack RSS feeds to EPUB format, making them easily readable on e-readers.

## Project Structure

This is a monorepo containing:

- `server`: Backend API service that handles the conversion
- `client`: (To be implemented) Frontend interface

## Backend Server

The server is a Node.js application using Bun and Express that provides an API endpoint to convert Substack feeds to EPUB.

### API Endpoints

- `POST /api/convert`: Converts a Substack feed to EPUB
  - Request body: `{ "substackName": "yoursubstack" }`
  - Response: `{ "success": true, "downloadUrl": "/output/yoursubstack-articles.epub", "fileName": "yoursubstack-articles.epub" }`

- `GET /health`: Health check endpoint
  - Response: `{ "status": "ok" }`

### Running Locally

```bash
# Change to the server directory
cd server

# Install dependencies
bun install

# Start the development server
bun dev
```

### Building and Running with Docker

```bash
# Build and start the Docker container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The server will be available at http://localhost:3001

## How It Works

1. The API receives a Substack name
2. It fetches the RSS feed from `[substackName].substack.com/feed`
3. Converts the feed content to Markdown
4. Uses Pandoc to convert the Markdown to EPUB
5. Provides a download link for the generated EPUB file

## Requirements

- Bun 1.0 or later
- Pandoc (installed in the Docker container)
- Docker and Docker Compose (for containerized deployment)
