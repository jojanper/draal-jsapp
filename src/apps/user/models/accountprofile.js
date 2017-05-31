const mongoose = require('mongoose');

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
}

module.exports = {
    model: AccountProfile,
    manager: new AccountProfileManager()
};
