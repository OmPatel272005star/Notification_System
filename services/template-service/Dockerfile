FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY template-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY template-service/ ./
EXPOSE 3003
CMD ["node", "app.js"]
