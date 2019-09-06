const passport = require('passport');

const core = require('../core');

const BaseCtrl = core.ctrl;
const ApiResponse = core.response;

/**
 * Validate API token before user can be granted access to proceed further.
 *
 * @param {*} req Request object.
 * @param {*} res Response object.
 * @param {*} next Next middleware function.
 */
function tokenAuth(req, res, next) {
    // Validate authentication token
    passport.authenticate('jwt', { session: false }, (err, payload) => {
        // Token is valid, proceed further
        if (!err && payload !== false && payload.user) {
            req.user = payload.user;
            return next();
        }

        const responseData = {
            statusCode: 401,
            messages: err ? [err] : []
        };

        // Accesss is forbidden
        const ctrl = new BaseCtrl(req, res, next);
        ctrl.renderResponse(new ApiResponse(responseData));
    })(req, res);
}

/**
 * Login required middleware.
 */
function isAuthenticated(req, res, next) {
    // User already authenticated using session ID?
    if (req.isAuthenticated()) {
        return next();
    }

    // Try token based authentication
    tokenAuth(req, res, next);
}

module.exports = {
    isAuthenticated
};
