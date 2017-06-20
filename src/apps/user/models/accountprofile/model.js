const mongoose = require('mongoose');

const UtilsLib = require('../../../../utils');


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

    activationKey: String,

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
    const start = new Date(this.user.createdAt).getTime();

    // Activation key is valid x days (in milliseconds) from registration day
    if (Date.now() > start + UtilsLib.getActivationThreshold()) {
        return true;
    }

    return this.status === ProfileStatuses.expired;
};

const AccountProfile = mongoose.model('AccountProfile', profileSchema);

module.exports = AccountProfile;
