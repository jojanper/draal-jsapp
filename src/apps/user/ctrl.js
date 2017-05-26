const User = require('./models/user');

const UserModel = User.model;

/**
 * Create a new local account.
 */
function signUp(req, res, next) {
    const user = new UserModel({
        email: req.body.email,
        password: req.body.password
    });

    User.manager.createUser(user, () => res.json(), err => next(err));
}

module.exports = [
    {
        fn: signUp,
        method: 'post',
        url: '/auth/signup'
    }
];
