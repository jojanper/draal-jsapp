const LocalStrategy = require('passport-local').Strategy;

const User = require('../src/apps/user/models/user');


function passportInit(passport) {
    /**
     * Required for persistent login sessions.
     * Passport needs ability to serialize and unserialize users out of session.
     */
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((id, done) => {
        User.manager.execute('findOne', {email: id.email}, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        User.manager.findLoginUser(email, password)
            .then(user => done(null, user))
            .catch(err => done(err));
    }));
}

module.exports = passportInit;
