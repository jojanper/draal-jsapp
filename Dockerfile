FROM node:carbon-alpine

COPY . /draaljs-app

WORKDIR /draaljs-app

RUN npm install --only=production

CMD ["node", "./app.js"]
