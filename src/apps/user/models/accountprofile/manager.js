const crypto = require('crypto');

const core = require('../../../core');

const AccountProfile = require('./model');
const APIError = require('../../../../error');
const UtilsLib = require('../../../../utils');

const BaseManager = core.manager;


class AccountProfileManager extends BaseManager {
    constructor() {
        super(AccountProfile);
    }

    createProfile(user) {
        const key = crypto.createHash('sha256').update(user.email).digest('hex');
        return this.getNewModel({user: user.id, activationKey: key}).save();
    }

    activateUser(activationKey) {
        let currentAccount;
        const dbObj = this.queryObj('findOne', {activationKey});
        const query = dbObj.getQuery().populate('user');

        return dbObj.setQuery(query).exec()
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
            });
    }
}

module.exports = new AccountProfileManager();
