## Links to various tutorials

### GraphQL
- https://github.com/apollographql/apollo-server
- https://github.com/amaurymartiny/graphql-example
- https://github.com/graphcool/graphql-server-example
- https://github.com/sitepoint-editors/graphql-nodejs (projections example!)
- https://marmelab.com/blog/2017/09/06/dive-into-graphql-part-iii-building-a-graphql-server-with-nodejs.html#integration-testing-of-the-query-engine

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
