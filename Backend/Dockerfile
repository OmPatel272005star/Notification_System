FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching — only reinstalls if deps change)
COPY package*.json ./

# Install production + dev dependencies (nodemon needed for start script)
RUN npm ci

# Copy rest of source code
COPY . .

# Expose the Express port
EXPOSE 3000

# Start the server
CMD ["node", "app.js"]
