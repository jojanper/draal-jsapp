const router = require('express').Router();

const APIError = require('../error');
const utilsLib = require('../utils');
const BaseCtrl = require('../apps/base_ctrl');
const ApiResponse = require('../apps/response');
const logger = require('../logger');

// User registration and authentication APIs
const userAPIs = require('../apps/user/ctrl');


/**
 * Login required middleware.
 */
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    const ctrl = new BaseCtrl(req, res, next);
    ctrl.renderResponse(new ApiResponse({statusCode: 401}));
}

const apiRoutes = [].concat(userAPIs);

module.exports = (prefix) => {
    router.get('', (req, res) => {
        logger.info('logging');
        const ctrl = new BaseCtrl(req, res);
        const data = utilsLib.serializeApiInfo(prefix, apiRoutes);
        ctrl.renderResponse(new ApiResponse({data}));
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
