const mongoose = require('mongoose');
const crypto = require('crypto');

const core = require('../../../../core');

const APIError = core.error;
const UtilsLib = core.utils;
const promiseExec = UtilsLib.promiseExecution;

const SESSION_EXPIRATION = parseInt(process.env.SESSION_EXPIRATION, 10);

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

userSchema.set('toObject', {
    getters: true,
    transform: (_doc, ret) => {
        delete ret.id;
        delete ret.password;
        delete ret.pwResetToken;
        delete ret.pwResetExpires;

        delete ret._id;
        delete ret.__v;
    }
});

/**
 * Serialize user data for login response.
 */
userSchema.methods.loginResponse = function loginResponse() {
    return Object.assign({
        expires: Date.now() + SESSION_EXPIRATION
    }, this.toObject());
};

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }

    const promise = UtilsLib.hashify(user.password);
    const [err, pwHash] = await promiseExec(promise);
    if (err) {
        return next(err);
    }

    user.password = pwHash;
    next();
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

    // Encrypt token
    const response = await promiseExec(UtilsLib.hashify(token));
    if (response[0]) {
        // Error, return rejected promise
        return Promise.reject(response[0]);
    }

    // Save encrypted token
    [, this.pwResetToken] = response;
    const [err, user] = await promiseExec(this.save());
    if (err) {
        // Error, return rejected promise
        return Promise.reject(err);
    }

    // Success, return resolved promise with user and token details
    return Promise.resolve([user, token]);
};

userSchema.methods.changePasswordWithToken = async function changePwWithToken(token, password) {
    // Validate reset token
    const promise = UtilsLib.hashComparison(token, this.pwResetToken, this, true);
    const response = await promiseExec(promise);
    if (response[0]) {
        throw new APIError('Invalid token');
    }

    // Validate expiration time for the token
    if (Date.now() > this.pwResetExpires) {
        throw new APIError('Password reset expired, please re-reset the password');
    }

    // Save new password
    this.password = password;
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
