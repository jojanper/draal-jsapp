const User = require('../apps/user/models/user');

module.exports = function resolvers() {
    return {
        RootQuery: {
            user(root, { id }, context) {
                return User.manager.findById(id, context);
            },
            users(root, args, context) {
                return User.manager.findAll({}, context);
            }
        }
    };
};
