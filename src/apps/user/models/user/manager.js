const format = require('util').format;

const User = require('./model');
const APIError = require('../../../../error');
const BaseManager = require('../../../base_manager');
const AccountProfile = require('../accountprofile');


class UserManager extends BaseManager {
    constructor() {
        super(User);
    }

    createUser(user) {
        return this.execute('findOne', {email: user.email})
            .then((existingUser) => {
                if (existingUser) {
                    const msg = format('Account with %s email address already exists', user.email);
                    throw new APIError(msg);
                }

                return user.save();
            })
            .then(savedUser => AccountProfile.manager.createProfile(savedUser));
    }

    findUser(email, active = undefined) {
        const data = {email: email.toLowerCase()};
        if (active !== undefined) {
            data.active = active;
        }

        return this.execute('findOne', data);
    }

    findLoginUser(email, password, success, error) {
        this.findUser(email, true)
            .then((user) => {
                if (!user) {
                    throw new APIError(`Email ${email} not found`);
                }

                return user.comparePassword(password);
            })
            .then(user => success(user))
            .catch(err => error(err));
    }

    _getUser(email) {
        return this.findUser(email).then((user) => {
            if (!user) {
                throw new APIError(`Email ${email} not found`);
            }

            if (!user.active) {
                throw new APIError('Password reset can be requested only for active user');
            }

            return Promise.resolve(user);
        });
    }

    passwordResetToken(email, success, error) {
        this._getUser(email)
            .then(user => user.createPwResetToken())
            .then(([user, token]) => success(user, token))
            .catch(err => error(err));
    }

    resetPassword(data, success, error) {
        this._getUser(data.email)
            .then(user => user.changePasswordWithToken(data.token, data.password))
            .then(user => success(user))
            .catch(err => error(err));
    }
}

module.exports = new UserManager();
