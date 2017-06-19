const crypto = require('crypto');
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
        return this.execute('findOne', {email: email.toLowerCase(), active}, null, error);
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
        this.findUser(email, error, false)
            .then((user) => {
                if (!user) {
                    throw new APIError(`Email ${email} not found`);
                }

                if (user.active) {
                    throw new APIError('Password reset can be requested only for active user');
                }

                const validDays = process.env.ACCOUNT_ACTIVATION_DAYS || 7;
                const delta = 24 * 3600000 * validDays;
                user.pwResetExpires = Date.now() + delta;
                user.pwResetToken = crypto.createHash('sha256').digest('hex');
                return user.save();
            })
            .then(user => success(user))
            .catch(err => error(err));
    }
}

module.exports = new UserManager();
