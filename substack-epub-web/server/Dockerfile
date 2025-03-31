FROM oven/bun:1.0 as base

# Install pandoc
RUN apt-get update && apt-get install -y pandoc

# Create app directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy all other files
COPY . .

# Expose the server port
EXPOSE 3001

# Start the server
CMD ["bun", "server.ts"]
