FROM node:12-alpine

COPY . .
RUN npm install topology-1.6.2.tgz
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]