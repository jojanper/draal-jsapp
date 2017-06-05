/**
 * Application business logic initialization.
 */
const utilsLib = require('./utils');
const index = require('./routes/index')();

const apiPrefix = '/api';
const api = require('./routes/api')(apiPrefix);

// Middleware for handling application errors
function apiMiddlewareErrorHandler(err, req, res, next) {
    if (err.name === 'APIError') {
        console.log('APIError');
        console.log(err.message);
        res.status(400);
        res.json({errors: [err.message]});
        res.end();
        console.log('APIError done');
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
        console.log('HEP');
        err.status = 404;
        console.log('HOP');
        next(err);
    });

    // Error handler
    /* eslint-disable no-unused-vars */
    app.use((err, req, res, next) => {
        console.trace('HTTP 500');
        console.log(err);
        console.log(res.status);

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
