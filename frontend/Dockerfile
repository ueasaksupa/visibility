FROM node:12-alpine

WORKDIR /app
COPY ./public ./public
COPY ./src ./src
COPY ./package.json .
COPY ./topology-1.6.12.tgz .

RUN npm install topology-1.6.12.tgz
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]