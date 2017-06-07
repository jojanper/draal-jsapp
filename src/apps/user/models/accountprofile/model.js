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
    const now = new Date().getTime();
    const start = new Date(this.user.createdAt).getTime();

    // Activation key is valid 7 days from registration day
    const delta = 1e3 * 24 * 3600 * 7;
    if (now > start + delta) {
        return true;
    }

    return this.status === ProfileStatuses.expired;
};

const AccountProfile = mongoose.model('AccountProfile', profileSchema);

module.exports = AccountProfile;
