const LocalStrategy = require('passport-local').Strategy;

const User = require('../src/apps/user/models/user');


function passportInit(passport) {
    /**
     * Required for persistent login sessions.
     * Passport needs ability to serialize and unserialize users out of session.
     */

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        User.findOne({ email: email.toLowerCase() }, (err, user) => {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { msg: `Email ${email} not found.` });
            }

            user.comparePassword(password, (err, isMatch) => {
                if (err) { return done(err); }
                if (isMatch) {
                    return done(null, user);
                }

                return done(null, false, { msg: 'Invalid email or password.' });
            });
        });
    }));
}

module.exports = passportInit;
