const crypto = require('crypto');

const AccountProfile = require('./model');
const APIError = require('../../../../error');
const UtilsLib = require('../../../../utils');
const BaseManager = require('../../../base_manager');


class AccountProfileManager extends BaseManager {
    constructor() {
        super(AccountProfile);
    }

    createProfile(user) {
        const key = crypto.createHash('sha256').update(user.email).digest('hex');
        return this.getNewModel({user: user.id, activationKey: key}).save();
    }

    activateUser(activationKey, success, error) {
        let currentAccount;
        const dbObj = this.queryObj('findOne', {activationKey});
        const query = dbObj.getQuery().populate('user');

        dbObj.setQuery(query).exec(error)
            .then((account) => {
                if (!account) {
                    throw new APIError('Invalid account activation key');
                }

                if (account.isActivated()) {
                    throw new APIError('Account already activated');
                }

                if (account.isExpired()) {
                    throw new APIError('Activation expired, please re-register');
                }

                currentAccount = account;
                account.user.active = true;
                return account.user.save();
            })
            .then(() => {
                currentAccount.setActivated();
                return UtilsLib.retryPromise(2, () => currentAccount.save());
            })
            .then(account => success(account))
            .catch(err => error(err));
    }
}

module.exports = new AccountProfileManager();
