const { resolvers: UserResolvers } = require('../apps/user/graphql');

/*
query {user(id: "5a6a39ed2564ff5365c79817") {
  email
}}
query {users}
*/
module.exports = {
    Query: Object.assign({}, UserResolvers.Query)
};
