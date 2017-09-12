const mongoose = require('mongoose');
const crypto = require('crypto');

const APIError = require('../../../../error');
const UtilsLib = require('../../../../utils');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },

    password: String,
    pwResetToken: String,
    pwResetExpires: Date,

    active: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

async function hashUserPassword(user, next) {
    const [err, pwHash] = await UtilsLib.promiseExecution(UtilsLib.hashify(user.password));
    if (err) {
        return next(err);
    }

    user.password = pwHash;
    next();
}

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }

    hashUserPassword(user, next);
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return UtilsLib.hashComparison(candidatePassword, this.password, this, 'Invalid password');
};

userSchema.methods.createPwResetToken = async function createResetToken() {

    // Create reset token with expiration data
    this.pwResetExpires = Date.now() + UtilsLib.getActivationThreshold();
    const token = crypto.createHash('sha256').digest('hex');
    this.pwResetToken = token;

    // Save token
    const [err, user] = await UtilsLib.promiseExecution(this.save());
    if (err) {
        // Error, return rejected promise
        return Promise.reject(err);
    }

    // Success, return resolved promise with user and token details
    return Promise.resolve([user, token]);
};

userSchema.methods.changePasswordWithToken = function changePasswordWithToken(token, password) {
    if (this.pwResetToken !== token) {
        throw new APIError('Invalid token');
    }

    if (Date.now() > this.pwResetExpires) {
        throw new APIError('Password reset expired, please re-reset the password');
    }

    this.password = password;
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
