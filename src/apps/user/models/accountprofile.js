const mongoose = require('mongoose');

const APIError = require('../../../error');
const BaseManager = require('../../base_manager');


const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },

    activation_key: String
});

const AccountProfile = mongoose.model('AccountProfile', profileSchema);

class AccountProfileManager extends BaseManager {
    constructor() {
        super(AccountProfile);
    }

    createProfile(user) {
        const Model = this.model;
        const profile = new Model({user: user.id, activation_key: '123'});
        return profile.save();
    }

    activateUser(activationKey, success, error) {
        /*
        this.query('findOne', {activation_key: activationKey})
            .populate('user').exec()
            */
        const obj = this.queryObj('findOne', {activation_key: activationKey});
        obj.setQuery(obj.getQuery().populate('user')).exec(error)
            .then((account) => {
                if (!account) {
                    return error(new APIError('Invalid account activation key'));
                }

                account.user.active = true;
                account.user.save()
                    .then(() => success())
                    .catch(err => error(err));
            });
            // .catch(err => error(err));
    }
}

module.exports = {
    model: AccountProfile,
    manager: new AccountProfileManager()
};
