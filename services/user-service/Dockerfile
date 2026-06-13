FROM node:20-alpine
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev
COPY user-service/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./shared/
COPY user-service/ ./
EXPOSE 3002
CMD ["node", "app.js"]
