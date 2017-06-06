const crypto = require('crypto');

const AccountProfile = require('./model');
const APIError = require('../../../../error');
const BaseManager = require('../../../base_manager');

class AccountProfileManager extends BaseManager {
    constructor() {
        super(AccountProfile);
    }

    createProfile(user) {
        const key = crypto.createHash('sha256').update(user.email).digest('hex');
        return this.getNewModel({user: user.id, activation_key: key}).save();
    }

    activateUser(activationKey, success, error) {
        const dbObj = this.queryObj('findOne', {activation_key: activationKey});
        const query = dbObj.getQuery().populate('user');

        dbObj.setQuery(query).exec(error)
            .then((account) => {
                if (!account) {
                    throw new APIError('Invalid account activation key');
                }

                account.user.active = true;
                return account.user.save();
            })
            .then(account => success(account))
            .catch(err => error(err));
    }
}

module.exports = new AccountProfileManager();
