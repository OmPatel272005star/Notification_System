# ── Stage 1: Build the React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# VITE_API_BASE_URL is baked into the JS bundle at build time.
# In Docker, the browser talks to the backend via the HOST machine port,
# so we use http://localhost:3000 (not the internal docker network name).
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# Copy the built app from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (handles SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
