/**
 * Application business logic initialization.
 */

const index = require('./routes/index');
const api = require('./routes/api');
const utilsLib = require('./utils');

function appBusinessLogicSetup(app) {
    app.use('/', index);
    app.use('/api', api);

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
