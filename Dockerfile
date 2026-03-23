FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY app.js ./
COPY styles.css ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
