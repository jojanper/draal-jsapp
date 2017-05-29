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
        User.manager.findLoginUser(email, password, user => done(null, user), err => done(err));
    }));
}

module.exports = passportInit;
