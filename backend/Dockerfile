FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p uploads/documentos

EXPOSE 3001

CMD ["node", "server.js"]
