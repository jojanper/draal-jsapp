const router = require('express').Router();

const { apiRoutes } = require('../apps');
const core = require('../core');
const { logger } = require('../logger');
const { isAuthenticated } = require('./middlewares');

const APIError = core.error;
const utilsLib = core.utils;
const BaseCtrl = core.ctrl;
const ApiResponse = core.response;

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

    utilsLib.setRoutes(router, apiRoutes, {
        authFn: isAuthenticated
    });

    return router;
};
