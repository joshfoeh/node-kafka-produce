FROM node:12.16-alpine
WORKDIR /usr/src/app
COPY package*.json index.js ./
RUN npm i
CMD ["npm", "start"]