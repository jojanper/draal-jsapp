const passport = require('passport');

const User = require('../../models/user');
const AccountProfile = require('../../models/accountprofile');
const APIError = require('../../../../error');
const TasksLib = require('../../../../tasks');
const UtilsLib = require('../../../../utils');
const BaseCtrl = require('../../../base_ctrl');
const ApiResponse = require('../../../response');
const ValidatorAPI = require('../../../../validators');


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

    static get VALIDATORS() {
        return [
            {
                field: 'email',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists, ValidatorAPI.VALIDATORS.email]
            },
            {
                field: 'password',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists]
            }
        ];
    }

    async action(done, error) {
        const user = new UserModel({
            email: this.req.body.email,
            password: this.req.body.password
        });

        const promise = User.manager.createUser(user);
        const [err, account] = await UtilsLib.promiseExecution(promise);
        if (err) {
            return error(err);
        }

        TasksLib.sendRegistrationEmail(user.email, account.activationKey);
        done();
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

    static get VALIDATORS() {
        return [
            {
                field: 'email',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists, ValidatorAPI.VALIDATORS.email]
            }
        ];
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

    static get VALIDATORS() {
        return [
            {
                field: 'email',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists, ValidatorAPI.VALIDATORS.email]
            },
            {
                field: 'token',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists]
            }
        ];
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

    async action(done, error) {
        const promise = AccountProfile.manager.activateUser(this.req.params.activationkey);
        const response = await UtilsLib.promiseExecution(promise);
        if (response[0]) {
            return error(response[0]);
        }

        done();
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

    static get VALIDATORS() {
        return [
            {
                field: 'email',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists, ValidatorAPI.VALIDATORS.email]
            },
            {
                field: 'password',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists]
            }
        ];
    }

    async action(done, error) {
        // First authenticate user, then login the authenticated user
        try {
            const user = await this._authenticate();
            await this._login(user);

            done(new ApiResponse({messages: ['Sign-in successful']}));
        } catch (err) {
            error(err);
        }
    }

    _authenticate() {
        return new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user) => {
                if (err) {
                    return reject(new APIError('Invalid credentials'));
                }

                resolve(user);
            })(this.req, this.res, this.next);
        });
    }

    _login(user) {
        return new Promise((resolve, reject) => {
            this.req.logIn(user, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
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

    action(done) {
        this.req.logout();
        done();
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
