FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY audience-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY audience-service/ ./
EXPOSE 3004
CMD ["node", "app.js"]
