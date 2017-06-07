const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const APIError = require('../../../../error');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },

    password: String,

    active: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) {
                reject(err);
            } else if (!isMatch) {
                reject(new APIError('Invalid password'));
            } else {
                resolve(this);
            }
        });
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;