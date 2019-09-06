const passport = require('passport');

const core = require('../../../../core');

const { User, AccountProfile } = require('../../models');
const TasksLib = require('../../../../tasks');

const APIError = core.error;
const ValidatorAPI = core.validators;
const BaseCtrl = core.ctrl;
const ApiResponse = core.response;

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

    async action() {
        const user = new UserModel({
            email: this.req.body.email,
            password: this.req.body.password
        });

        const account = await User.manager.createUser(user);
        TasksLib.sendRegistrationEmail(user.email, account.activationKey);
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

    async action() {
        const promise = User.manager.passwordResetToken(this.req.body.email);
        const [user, token] = await promise;
        TasksLib.sendPasswordResetEmail(user.email, token);
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

    action() {
        return User.manager.resetPassword(this.req.body);
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

    action() {
        return AccountProfile.manager.activateUser(this.req.params.activationkey);
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

    async action() {
        const user = await this._authenticate();
        await this._login(user);
        return new ApiResponse({
            data: user.loginResponse(),
            messages: ['Sign-in successful']
        });
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
 * Get token for API requests.
 */
class APIToken extends SignIn {
    static get CLASSINFO() {
        return {
            INFO: 'Get API token',
            VERSION: version1,
            NAME: 'token',
            URLPREFIX: urlPrefix
        };
    }

    async action() {
        const user = await this._authenticate();
        return new ApiResponse({
            data: user.tokenResponse(),
            messages: ['Token creation successful']
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

    action() {
        this.req.logout();
        return Promise.resolve();
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
        cls: APIToken
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
