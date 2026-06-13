FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY scheduler-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY scheduler-service/ ./
# No HTTP port — cron daemon
CMD ["node", "app.js"]
