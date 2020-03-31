const { format } = require('util');

const core = require('../../../../core');
const User = require('./model');
const AccountProfile = require('../accountprofile');

const APIError = core.error;
const BaseManager = core.manager;


class UserManager extends BaseManager {
    constructor() {
        super(User);
    }

    createUser(user) {
        return this.execute('findOne', { email: user.email })
            .then(existingUser => {
                if (existingUser) {
                    const msg = format('Account with %s email address already exists', user.email);
                    throw new APIError(msg);
                }

                return user.save();
            })
            .then(savedUser => AccountProfile.manager.createProfile(savedUser));
    }

    findUser(email, active = undefined) {
        const data = { email: email.toLowerCase() };
        if (active !== undefined) {
            data.active = active;
        }

        return this.execute('findOne', data);
    }

    findLoginUser(email, password) {
        return this.findUser(email, true).then(user => {
            if (!user) {
                throw new APIError(`Email ${email} not found`);
            }

            return user.comparePassword(password);
        });
    }

    _getUser(email) {
        return this.findUser(email).then(user => {
            if (!user) {
                throw new APIError(`Email ${email} not found`);
            }

            if (!user.active) {
                throw new APIError('Password reset can be requested only for active user');
            }

            return Promise.resolve(user);
        });
    }

    passwordResetToken(email) {
        return this._getUser(email).then(user => user.createPwResetToken());
    }

    resetPassword(data) {
        return this._getUser(data.email)
            .then(user => user.changePasswordWithToken(data.token, data.password));
    }
}

module.exports = new UserManager();
