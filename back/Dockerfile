FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 30001
CMD ["sh", "-c", "node migracion.js && node app.js"]