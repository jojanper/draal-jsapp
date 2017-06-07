const mongoose = require('mongoose');

const ProfileStatuses = {
    active: 'Active',
    activated: 'Activated',
    expired: 'Expired'
};

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },

    activation_key: String,

    status: {
        type: String,
        default: ProfileStatuses.active
    }
});

profileSchema.statics.getStatuses = function getStatuses() {
    return ProfileStatuses;
};

profileSchema.methods.setActivated = function setActivated() {
    this.status = ProfileStatuses.activated;
    return this;
};

profileSchema.methods.setExpired = function setExpired() {
    this.status = ProfileStatuses.expired;
    return this;
};

profileSchema.methods.isActivated = function isActivated() {
    return this.status === ProfileStatuses.activated;
};

profileSchema.methods.isExpired = function isExpired() {
    return this.status === ProfileStatuses.expired;
};

const AccountProfile = mongoose.model('AccountProfile', profileSchema);

module.exports = AccountProfile;
