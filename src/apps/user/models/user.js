const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const format = require('util').format;

const APIError = require('../../../error');


const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String,
    active: {type: Boolean, default: false}

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
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

const User = mongoose.model('User', userSchema);

const manager = {
    createUser(user, success, error) {
        User.findOne({email: user.email}, (err, existingUser) => {
            if (existingUser) {
                return error(new APIError(format('Account with %s email address already exists', user.email)));
            }

            if (err) { return error(err); }

            user.save().then(() => success()).catch(err => error(err));
        });
    }
};

module.exports = {
    model: User,
    manager
};
