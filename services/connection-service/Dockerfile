FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY connection-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY connection-service/ ./
EXPOSE 3006
CMD ["node", "app.js"]
