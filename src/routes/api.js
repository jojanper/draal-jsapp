const router = require('express').Router();

const { apiRoutes } = require('../apps');
const core = require('../core');
const { logger } = require('../logger');

const APIError = core.error;
const utilsLib = core.utils;
const BaseCtrl = core.ctrl;
const ApiResponse = core.response;


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

module.exports = (prefix) => {
    router.get('', (req, res) => {
        logger.info('info logging');
        logger.error('error logging');
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
