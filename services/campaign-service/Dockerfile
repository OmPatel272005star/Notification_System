FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY campaign-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY campaign-service/ ./
EXPOSE 3005
CMD ["node", "app.js"]
