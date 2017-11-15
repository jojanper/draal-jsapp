FROM node:8.9.0

COPY . /draaljs-app

WORKDIR /draaljs-app

RUN npm install

CMD ["npm", "run", "start-prod"]
