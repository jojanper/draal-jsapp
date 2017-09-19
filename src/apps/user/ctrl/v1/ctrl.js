const passport = require('passport');
const format = require('util').format;

const User = require('../../models/user');
const AccountProfile = require('../../models/accountprofile');
const APIError = require('src/error');
const TasksLib = require('src/tasks');
const BaseCtrl = require('../../../base_ctrl');

const UserModel = User.model;

/**
 * Create a new local account.
 */
class SignUp extends BaseCtrl {
    action(done, error) {
        const user = new UserModel({
            email: this.req.body.email,
            password: this.req.body.password
        });

        User.manager.createUser(user,
            (account) => {
                TasksLib.sendRegistrationEmail(user.email, account.activationKey);
                done(`${account.activationKey}`);
            },
            error
        );
    }
}

/**
 * Request user password reset.
 */
class PwResetRequest extends BaseCtrl {
    action(done, error) {
        User.manager.passwordResetToken(this.req.body.email,
            (user, token) => {
                TasksLib.sendPasswordResetEmail(user.email, token);
                done(`${token}`);
            },
            error
        );
    }
}

/**
 * Change user password using token identifier.
 */
class PwResetActivation extends BaseCtrl {
    action(done, error) {
        User.manager.resetPassword(this.req.body, () => done(), error);
    }
}

/**
 * Activate user account.
 */
class UserActivation extends BaseCtrl {
    action(done, error) {
        AccountProfile.manager.activateUser(this.req.params.activationkey, () => done(), error);
    }
}

/**
 * Login using local account.
 */
class SignIn extends BaseCtrl {
    execute() {
        passport.authenticate('local', (err, user) => {
            if (err) {
                return this.next(new APIError('Invalid credentials'));
            }

            this.req.logIn(user, (err) => {
                if (err) {
                    return this.next(err);
                }

                this.res.json('Sign-in successful');
            });
        })(this.req, this.res, this.next);
    }
}

/**
 * User logout.
 */
class SignOut extends BaseCtrl {
    execute() {
        this.req.logout();
        this.res.json();
    }
}

function apiFormat(postfix) {
    return format('/auth/%s', postfix);
}

// API version 1
const version = 1;

module.exports = [
    {
        cls: SignUp,
        method: 'post',
        url: apiFormat('signup'),
        info: 'User sign-up',
        version,
        name: 'register'
    },
    {
        cls: UserActivation,
        method: 'post',
        url: apiFormat('activate/:activationkey'),
        info: 'User account activation',
        version,
        name: 'account-activation'
    },
    {
        cls: SignIn,
        method: 'post',
        url: apiFormat('login'),
        info: 'User sign-in',
        version,
        name: 'login'
    },
    {
        cls: SignOut,
        method: 'post',
        url: apiFormat('logout'),
        authenticate: true,
        info: 'User sign-out',
        version,
        name: 'logout'
    },
    {
        cls: PwResetRequest,
        method: 'post',
        url: apiFormat('password-reset-request'),
        info: 'User password reset request',
        version,
        name: 'password-reset-request'
    },
    {
        cls: PwResetActivation,
        method: 'post',
        url: apiFormat('password-reset'),
        info: 'User password change using reset token',
        version,
        name: 'password-reset'
    }
];
