const mongoose = require('mongoose');


const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },

    activation_key: String
});

const AccountProfile = mongoose.model('AccountProfile', profileSchema);

module.exports = AccountProfile;
