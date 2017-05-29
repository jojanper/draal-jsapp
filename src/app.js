/**
 * Application business logic initialization.
 */
const utilsLib = require('./utils');
const index = require('./routes/index')();
const api = require('./routes/api')();

const apiPrefix = '/api';

// Middleware for handling application errors
function apiMiddlewareErrorHandler(err, req, res, next) {
    if (err.name === 'APIError') {
        res.status(400);
        res.json({errors: [err.message]});
        res.end();
        return;
    }

    return next(err);
}

function appBusinessLogicSetup(app) {
    // Application API routes
    app.use('/', index);
    app.use(apiPrefix, api);

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

        // Render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    /* eslint-enable no-unused-vars */
}

module.exports = appBusinessLogicSetup;