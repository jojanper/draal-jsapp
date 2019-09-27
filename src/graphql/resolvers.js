const { resolvers: UserResolvers } = require('../apps/user/graphql');

module.exports = {
    Query: { ...UserResolvers.Query }
};
