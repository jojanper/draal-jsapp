const { User } = require('../models');

module.exports = {
    Query: {
        user(root, { id }, context, info) {
            console.log(info.fieldNodes[0].selectionSet);
            return User.manager.execute('findOne', {_id: id});
        },
        users(root, args, context) {
            console.log(context);
            return User.manager.execute('find');
        }
    }
};
