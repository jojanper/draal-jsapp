FROM node:carbon-alpine

COPY . /draaljs-app

WORKDIR /draaljs-app

ENV NODE_ENV production

RUN npm install --only=production

CMD ["node", "./app.js"]
