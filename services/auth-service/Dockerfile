FROM node:20-alpine
WORKDIR /app

# 1. Install shared layer deps
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev

# 2. Install service deps
COPY auth-service/package*.json ./
RUN npm install --omit=dev

# 3. Copy all source
COPY shared/ ./shared/
COPY auth-service/ ./

EXPOSE 3001
CMD ["node", "app.js"]
