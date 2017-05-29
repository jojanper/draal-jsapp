const passport = require('passport');

const User = require('./models/user');
const APIError = require('src/error');

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

function signIn(req, res, next) {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return next(new APIError('Invalid credentials'));
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            res.json('Sign-in successful');
        });
    })(req, res, next);
}

module.exports = [
    {
        fn: signUp,
        method: 'post',
        url: '/auth/signup'
    },
    {
        fn: signIn,
        method: 'post',
        url: '/auth/login'
    }
];
