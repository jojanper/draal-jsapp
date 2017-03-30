FROM node:6.10.1

COPY . /draaljs-app

WORKDIR /draaljs-app

RUN npm install

CMD ["npm", "start-prod"]

EXPOSE 3008
