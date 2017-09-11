const bcrypt = require('bcrypt');
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

function tokenComparison(value, reference, resolveValue, errorMessage) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(value, reference, (err, isMatch) => {
            if (err) {
                reject(err);
            } else if (!isMatch) {
                reject(new APIError(errorMessage));
            } else {
                resolve(resolveValue);
            }
        });
    });
}

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return tokenComparison(candidatePassword, this.password, this, 'Invalid password');
};

userSchema.methods.createPwResetToken = function createResetToken() {
    this.pwResetExpires = Date.now() + UtilsLib.getActivationThreshold();
    const token = crypto.createHash('sha256').digest('hex');
    this.pwResetToken = token;
    return new Promise((resolve, reject) => {
        this.save()
            .then(user => resolve([user, token]))
            .catch(err => reject(err));
    });
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
