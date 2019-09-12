const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');

const User = require('../src/apps/user/models/user');

/**
 * Extract and return API token from HTTP authorization header.
 * Look for 'Token' and 'Bearer' keyword in from of the token.
 *
 * @param {*} req Request object.
 */
function getTokenFromHeader(req) {
    if (req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ');
        if (authorization[0] === 'Token' || authorization[0] === 'Bearer') {
            return authorization[1];
        }
    }

    return null;
}

function passportInit(passport) {
    /**
     * Required for persistent login sessions.
     * Passport needs ability to serialize and unserialize users out of session.
     */
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((id, done) => {
        User.manager.execute('findOne', { email: id.email }, (err, user) => {
            done(err, user);
        });
    });

    // Validate if specified email/password can be found from app databases
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        User.manager.findLoginUser(email, password)
            .then(user => done(null, user))
            .catch(err => done(err));
    }));

    const jwtOpts = {
        jwtFromRequest: getTokenFromHeader,
        secretOrKey: process.env.SESSION_SECRET,
        passReqToCallback: true
    };

    // Validation for API token
    passport.use(new passportJWT.Strategy(jwtOpts, (req, payload, done) => {
        if (Date.now() > payload.expires) {
            return done('Authorization token expired, please request new token', null);
        }

        // Assign user to request, this implicitly makes request authenticated
        req.user = payload.user;

        return done(null, payload);
    }));
}

module.exports = passportInit;
