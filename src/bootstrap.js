/**
 * Application business logic initialization.
 */
const core = require('./core');
const routes = require('./routes');
const { logger } = require('./logger');

const BaseCtrl = core.ctrl;
const ApiResponse = core.response;
const utilsLib = core.utils;

const apiPrefix = '/api';


// Middleware for handling application errors
function apiMiddlewareErrorHandler(err, req, res, next) {
    if (err.name === 'APIError') {
        const ctrl = new BaseCtrl(req, res, next);
        const errors = (err.message.constructor === Array) ? err.message : [err.message];
        ctrl.renderResponse(new ApiResponse({errors, statusCode: 400}));
        return;
    }

    return next(err);
}

function appBusinessLogicSetup(app) {
    // Application API routes
    app.use('/', routes.entry());
    app.use(apiPrefix, routes.api(apiPrefix));

    // Catch and handle application errors
    app.use(`${apiPrefix}/*`, apiMiddlewareErrorHandler);

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // Error handler
    /* eslint-disable no-unused-vars */
    app.use((err, req, res, next) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = utilsLib.isDevelopment(req.app) ? err : {};

        if (!err.status) {
            logger.error(err);
            logger.error(console.trace());
        }

        // Render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    /* eslint-enable no-unused-vars */
}

module.exports = appBusinessLogicSetup;
