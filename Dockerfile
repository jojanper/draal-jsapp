FROM node:8.4.0

COPY . /draaljs-app

WORKDIR /draaljs-app

RUN npm install

CMD ["npm", "run", "start-prod"]
