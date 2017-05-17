const router = require('express').Router();
const APIError = require('../error');
const utilsLib = require('../utils');

// User registration and authentication APIs
const userAPIs = require('../apps/user/ctrl');

module.exports = () => {
    router.get('', (req, res) => {
        res.json({foo: 'bar'});
    });

    router.get('/error', () => {
        throw new APIError('API error occured');
    });

    router.get('/unhandled-error', () => {
        throw new Error('Application is not expected to handle this error');
    });

    utilsLib.setRoutes(router, userAPIs);

    return router;
};
