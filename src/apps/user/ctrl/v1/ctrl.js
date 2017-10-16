const passport = require('passport');

const User = require('../../models/user');
const AccountProfile = require('../../models/accountprofile');
const APIError = require('src/error');
const TasksLib = require('src/tasks');
const BaseCtrl = require('../../../base_ctrl');


const UserModel = User.model;

// API version 1
const version1 = 1;

// API URL prefix
const urlPrefix = 'auth';


/**
 * Create a new local account.
 */
class SignUp extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User sign-up',
            VERSION: version1,
            NAME: 'signup',
            URLPREFIX: urlPrefix
        };
    }

    action(done, error) {
        const user = new UserModel({
            email: this.req.body.email,
            password: this.req.body.password
        });

        User.manager.createUser(user,
            (account) => {
                TasksLib.sendRegistrationEmail(user.email, account.activationKey);
                console.log(account.activationKey);
                done();
            },
            error
        );
    }
}

/**
 * Request user password reset.
 */
class PwResetRequest extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User password reset request',
            VERSION: version1,
            NAME: 'password-reset-request',
            URLPREFIX: urlPrefix
        };
    }

    action(done, error) {
        User.manager.passwordResetToken(this.req.body.email,
            (user, token) => {
                TasksLib.sendPasswordResetEmail(user.email, token);
                console.log(token);
                done();
            },
            error
        );
    }
}

/**
 * Change user password using token identifier.
 */
class PwResetActivation extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User password change using reset token',
            VERSION: version1,
            NAME: 'password-reset',
            URLPREFIX: urlPrefix
        };
    }

    action(done, error) {
        User.manager.resetPassword(this.req.body, () => done(), error);
    }
}

/**
 * Activate user account.
 */
class UserActivation extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User account activation',
            VERSION: version1,
            NAME: 'account-activation',
            URL: 'activate/:activationkey',
            URLPREFIX: urlPrefix
        };
    }

    action(done, error) {
        AccountProfile.manager.activateUser(this.req.params.activationkey, () => done(), error);
    }
}

/**
 * Login using local account.
 */
class SignIn extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User sign-in',
            VERSION: version1,
            NAME: 'login',
            URLPREFIX: urlPrefix
        };
    }

    execute() {
        passport.authenticate('local', (err, user) => {
            if (err) {
                return this.next(new APIError('Invalid credentials'));
            }

            this.req.logIn(user, (err) => {
                if (err) {
                    return this.next(err);
                }

                this.renderResponse({messages: ['Sign-in successful']});
            });
        })(this.req, this.res, this.next);
    }
}

/**
 * User logout.
 */
class SignOut extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User sign-out',
            NAME: 'logout',
            URLPREFIX: urlPrefix,
            AUTHENTICATE: true
        };
    }

    execute() {
        this.req.logout();
        this.renderResponse();
    }
}


// Export controllers
module.exports = [
    {
        cls: SignUp
    },
    {
        cls: UserActivation
    },
    {
        cls: SignIn
    },
    {
        cls: SignOut
    },
    {
        cls: PwResetRequest
    },
    {
        cls: PwResetActivation
    }
];
