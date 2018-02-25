const { makeExecutableSchema } = require('graphql-tools');

const Base = require('./base');
const resolvers = require('./resolvers');
const { schema: UserSchema } = require('../apps/user/graphql');

const schema = makeExecutableSchema({
    typeDefs: [
        Base,
        UserSchema
    ],
    resolvers
});

const graphql = exports;

graphql.schema = schema;
