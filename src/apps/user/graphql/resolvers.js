const User = require('../models/user');

module.exports = {
    Query: {
        user(root, { id }, context, info) {
            console.log(info.fieldNodes[0].selectionSet);
            return User.manager.execute('findOne', {_id: id});
        },
        users() {
            return User.manager.execute('find');
        }
    }
};
