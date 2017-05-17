const format = require('util').format;

const User = require('./models/user');
const APIError = require('../../error');

/**
 * Create a new local account.
 */
function signUp(req, res, next) {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({email: req.body.email}, (err, existingUser) => {
        if (existingUser) {
            return next(new APIError(format('Account with %s email address already exists', user.email)));
        }

        if (err) { return next(err); }

        user.save((err) => {
            if (err) { return next(err); }
            res.json();
        });
    });
}

module.exports = [
    {
        fn: signUp,
        method: 'post',
        url: '/auth/signup'
    }
];
