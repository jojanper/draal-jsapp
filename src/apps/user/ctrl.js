const passport = require('passport');
const format = require('util').format;

const User = require('./models/user');
const AccountProfile = require('./models/accountprofile');
const APIError = require('src/error');
const TasksLib = require('src/tasks');
const BaseCtrl = require('../base_ctrl');

const UserModel = User.model;

/**
 * Create a new local account.
 */
function signUp(req, res, next) {
    const user = new UserModel({
        email: req.body.email,
        password: req.body.password
    });

    this.action = (done, error) => {
        User.manager.createUser(user,
            (account) => {
                TasksLib.sendRegistrationEmail(user.email, account.activationKey);
                done(`${account.activationKey}`);
            },
            error
        );
    };

    return BaseCtrl.create(this, res, next);
}

/**
 * Request user password reset.
 */
function pwResetRequest(req, res, next) {
    this.action = (done, error) => {
        User.manager.passwordResetToken(req.body.email,
            (user) => {
                TasksLib.sendPasswordResetEmail(user.email, user.pwResetToken);
                done(`${user.pwResetToken}`);
            },
            error
        );
    };

    return BaseCtrl.create(this, res, next);
}

/**
 * Change user password using token identifier.
 */
function pwResetActivation(req, res, next) {
    this.action = (done, error) => {
        User.manager.resetPassword(req.body, () => done(), error);
    };

    return BaseCtrl.create(this, res, next);
}

/**
 * Activate user account.
 */
function userActivation(req, res, next) {
    this.action = (done, error) => {
        AccountProfile.manager.activateUser(req.params.activationkey, () => done(), error);
    };

    return BaseCtrl.create(this, res, next);
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
    },
    {
        fn: pwResetRequest,
        method: 'post',
        url: apiFormat('password-reset-request'),
        info: 'User password reset request'
    },
    {
        fn: pwResetActivation,
        method: 'post',
        url: apiFormat('password-reset'),
        info: 'User password change using reset token'
    }
];
