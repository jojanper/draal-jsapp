const User = require('../apps/user/models/user');

/*
query {user(id: "5a6a39ed2564ff5365c79817") {
  email
}}
query {users}
*/
module.exports = function resolvers() {
    return {
        RootQuery: {
            user(root, { id }, context, info) {
                /*
                console.log(root);
                console.log(context);
                console.log(id);
                */
                console.log(info.fieldNodes[0].selectionSet);
                return User.manager.execute('findOne', {_id: id});
            },
            users() {
                return User.manager.execute('find');
            }
        }
    };
};
