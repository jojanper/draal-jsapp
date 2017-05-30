const router = require('express').Router();
const APIError = require('../error');
const utilsLib = require('../utils');

// User registration and authentication APIs
const userAPIs = require('../apps/user/ctrl');

/**
 * Login required middleware.
 */
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.status(401);
    res.json();
    res.end();
}

const apiRoutes = [].concat(userAPIs);

module.exports = () => {
    router.get('', (req, res) => {
        res.json(utilsLib.serializeApiInfo(apiRoutes));
    });

    router.get('/error', () => {
        throw new APIError('API error occured');
    });

    router.get('/unhandled-error', () => {
        throw new Error('Application is not expected to handle this error');
    });

    utilsLib.setRoutes(router, apiRoutes, isAuthenticated);

    return router;
};
