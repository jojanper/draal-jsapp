## Links to various tutorials

### GraphQL
- https://github.com/apollographql/apollo-server
- https://github.com/amaurymartiny/graphql-example
- https://github.com/graphcool/graphql-server-example
- https://github.com/sitepoint-editors/graphql-nodejs (projections example!)
- https://marmelab.com/blog/2017/09/06/dive-into-graphql-part-iii-building-a-graphql-server-with-nodejs.html#integration-testing-of-the-query-engine
- https://dev-blog.apollodata.com/4-simple-ways-to-call-a-graphql-api-a6807bcdb355
- https://medium.com/@james_mensch/production-apollo-graphql-authentication-authorization-6dbce79d6f1b
- https://about.sourcegraph.com/graphql/handling-authentication-and-authorization-in-graphql/
- https://blog.codeship.com/graphql-as-an-api-gateway-to-micro-services/
- https://blog.cloudboost.io/a-crud-app-with-apollo-graphql-nodejs-express-mongodb-angular5-2874111cd6a5
- https://developer.github.com/v4/guides/forming-calls/
- https://scotch.io/@codediger/build-a-simple-graphql-api-server-with-express-and-nodejs

### Token authentication
- https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
- https://github.com/auth0/node-jsonwebtoken

### SocketIO
- https://www.codementor.io/tips/0217388244/sharing-passport-js-sessions-with-both-express-and-socket-io
- https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender/10099325#10099325

  ```
  // sending to sender-client only
  socket.emit('message', "this is a test");

  // sending to all clients, include sender
  io.emit('message', "this is a test");

  // sending to all clients except sender
  socket.broadcast.emit('message', "this is a test");

  // sending to all clients in 'game' room(channel) except sender
  socket.broadcast.to('game').emit('message', 'nice game');

  // sending to all clients in 'game' room(channel), include sender
  io.in('game').emit('message', 'cool game');

  // sending to sender client, only if they are in 'game' room(channel)
  socket.to('game').emit('message', 'enjoy the game');

  // sending to all clients in namespace 'myNamespace', include sender
  io.of('myNamespace').emit('message', 'gg');

  // sending to individual socketid
  socket.broadcast.to(socketid).emit('message', 'for your eyes only');
  ```

### Docker
- https://blog.hasura.io/an-exhaustive-guide-to-writing-dockerfiles-for-node-js-web-apps-bbee6bd2f3c4
- https://learnk8s.io/blog/smaller-docker-images
- https://medium.com/@basi/docker-compose-from-development-to-production-88000124a57c
- https://github.com/GoogleCloudPlatform/distroless
- https://github.com/JustinBeckwith/nodistro
