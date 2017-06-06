const passport = require('passport');
const format = require('util').format;

const User = require('./models/user');
const AccountProfile = require('./models/accountprofile');
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

    User.manager.createUser(user,
        () => res.json(),
        err => next(err)
    );
}

/**
 * Activate user account.
 */
function userActivation(req, res, next) {
    AccountProfile.manager.activateUser(req.params.activationkey,
        () => res.json(),
        err => next(err)
    );
}

/**
 * Login using local account.
 */
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

/**
 * User logout.
 */
function signOut(req, res) {
    req.logout();
    res.json();
}

function apiFormat(postfix) {
    return format('/auth/%s', postfix);
}

module.exports = [
    {
        fn: signUp,
        method: 'post',
        url: apiFormat('signup'),
        info: 'User sign-up'
    },
    {
        fn: userActivation,
        method: 'post',
        url: apiFormat('activate/:activationkey'),
        info: 'User account activation'
    },
    {
        fn: signIn,
        method: 'post',
        url: apiFormat('login'),
        info: 'User sign-in'
    },
    {
        fn: signOut,
        method: 'post',
        url: apiFormat('logout'),
        authenticate: true,
        info: 'User sign-out'
    }
];
