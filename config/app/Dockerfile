FROM node:carbon-slim AS build

COPY node-src.tar /draaljs-app/
WORKDIR /draaljs-app
RUN tar -xvf node-src.tar && rm node-src.tar

RUN npm install --production

FROM node:carbon-slim
COPY --from=build /draaljs-app /draaljs-app
WORKDIR /draaljs-app
ENV NODE_ENV production
VOLUME ["/draaljs-app"]

ENTRYPOINT ["node", "./app.js"]
