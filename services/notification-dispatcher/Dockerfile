FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY notification-dispatcher/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY notification-dispatcher/ ./
# No HTTP port — this is a pure Kafka consumer daemon
CMD ["node", "app.js"]
