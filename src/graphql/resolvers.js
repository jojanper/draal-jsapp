const { resolvers: UserResolvers } = require('../apps/user/graphql');

module.exports = {
    Query: Object.assign({}, UserResolvers.Query)
};
