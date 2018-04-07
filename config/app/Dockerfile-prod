FROM node:8.9 AS build

COPY node-src.tar /draaljs-app/
WORKDIR /draaljs-app
RUN tar -xvf node-src.tar && rm node-src.tar
RUN npm install --production

FROM gcr.io/distroless/nodejs

COPY --from=build /draaljs-app /draaljs-app
WORKDIR /draaljs-app
ENV NODE_ENV production
VOLUME ["/draaljs-app"]
ENTRYPOINT ["/nodejs/bin/node", "./app.js"]
