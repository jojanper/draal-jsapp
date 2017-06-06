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

    findLoginUser(email, password, success, error) {
        this.execute('findOne', {email: email.toLowerCase(), active: true}, null, error)
            .then((user) => {
                if (!user) {
                    throw new APIError(`Email ${email} not found`);
                }

                return user.comparePassword(password);
            })
            .then(user => success(user))
            .catch(err => error(err));
    }
}

module.exports = new UserManager();
