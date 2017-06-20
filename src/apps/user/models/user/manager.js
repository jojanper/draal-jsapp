const format = require('util').format;

const User = require('./model');
const APIError = require('../../../../error');
const BaseManager = require('../../../base_manager');
const AccountProfile = require('../accountprofile');


class UserManager extends BaseManager {
    constructor() {
        super(User);
    }

    createUser(user, success, error) {
        this.execute('findOne', {email: user.email}, null, error)
            .then((existingUser) => {
                if (existingUser) {
                    throw new APIError(format('Account with %s email address already exists', user.email));
                }

                return user.save();
            })
            .then(savedUser => AccountProfile.manager.createProfile(savedUser))
            .then(savedAccountProfile => success(savedAccountProfile))
            .catch(err => error(err));
    }

    findUser(email, error, active = true) {
        const data = {email: email.toLowerCase()};
        if (active !== null) {
            data.active = active;
        }
        return this.execute('findOne', data, null, error);
    }

    findLoginUser(email, password, success, error) {
        this.findUser(email, error)
            .then((user) => {
                if (!user) {
                    throw new APIError(`Email ${email} not found`);
                }

                return user.comparePassword(password);
            })
            .then(user => success(user))
            .catch(err => error(err));
    }

    resetPassword(email, success, error) {
        this.findUser(email, error, null)
            .then((user) => {
                if (!user) {
                    throw new APIError(`Email ${email} not found`);
                }

                if (!user.active) {
                    throw new APIError('Password reset can be requested only for active user');
                }

                return user.createPwResetToken();
            })
            .then(user => success(user))
            .catch(err => error(err));
    }
}

module.exports = new UserManager();
