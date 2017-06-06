const AccountProfile = require('./model');
const APIError = require('../../../../error');
const BaseManager = require('../../../base_manager');

class AccountProfileManager extends BaseManager {
    constructor() {
        super(AccountProfile);
    }

    createProfile(user) {
        return this.getNewModel({user: user.id, activation_key: '123'}).save();
    }

    activateUser(activationKey, success, error) {
        const dbObj = this.queryObj('findOne', {activation_key: activationKey});
        const query = dbObj.getQuery().populate('user');
        dbObj.setQuery(query).exec(error)
            .then((account) => {
                if (!account) {
                    return error(new APIError('Invalid account activation key'));
                }

                account.user.active = true;
                account.user.save()
                    .then(() => success())
                    .catch(err => error(err));
            });
    }
}

module.exports = new AccountProfileManager();
