const bcrypt = require('bcrypt');
const util = require('util');

const APIError = require('./error');
const ValidatorAPI = require('./validators');


const pause = duration => new Promise(res => setTimeout(res, duration));

const retry = (retries, fn, delay = 500) =>
    fn().catch(err => ((retries > 1) ?
        pause(delay).then(() => retry(retries - 1, fn, delay * 2))
        : Promise.reject(err)));

const DEFAULT_HTTP_METHOD = 'post';


module.exports = {
    /**
     * Check application development mode status.
     *
     * @param {object} app Express application object.
     *
     * @returns {boolean} true if development mode enabled, false otherwise
     */
    isDevelopment(app) {
        return app.get('env') === 'development';
    },

    /**
     * Set routes for application use.
     *
     * @param {object} router Router object.
     * @param {array} routes List of routes to be included for application.
     * @param {object} middlewares Middlewares to be attached to the routes.
     * @param {function} middlewares.authFn Authentication middleware.
     *
     * @returns {object} Router object.
     */
    setRoutes(router, routes, middlewares) {
        routes.forEach((route) => {
            // Path of HTTP request
            const args = [route.cls.url];

            // Is authentication required
            if (route.cls.CLASSINFO.AUTHENTICATE) {
                args.push(middlewares.authFn);
            }

            // Include input validations, if available
            const validatorOptions = route.cls.VALIDATORS;
            if (validatorOptions && validatorOptions.length) {
                validatorOptions.forEach((option) => {
                    const obj = new ValidatorAPI(option);
                    args.push(obj.validator);
                });
            }

            // Actual API implementation is executed as last item
            args.push(route.cls.apiEntry());

            // Include the route definition for the application
            router[route.cls.CLASSINFO.METHOD || DEFAULT_HTTP_METHOD](...args);
        });

        return router;
    },

    /**
     * Serialize API routes.
     *
     * @param {string} prefix URL prefix for routes.
     * @param {array} routes List of API routes.
     *
     * @returns {object} Serialized API data.
     */
    serializeApiInfo(prefix, routes) {
        return routes.map(item => item.cls.serialize(prefix, DEFAULT_HTTP_METHOD));
    },

    /**
     * Graceful re-try in the event of Promise failure.
     *
     * @param {number} retries Number of re-try attempts.
     * @param {function} fn Function that returns promise when called.
     * @param {number} [delay=500] Delay between re-try attemps in milliseconds.
     *
     * @returns {object} Promise.
     */
    retryPromise: retry,

    /**
     * Determine time threshold that can be used for user related activities
     * requiring, for example, expiration time.
     *
     * @returns {number} Time threshold, in milliseconds.
     */
    getActivationThreshold() {
        const validDays = process.env.ACCOUNT_ACTIVATION_DAYS || 7;
        return 24 * 3600000 * validDays;
    },

    /**
     * Hash input string (password, etc).
     *
     * @param {string} text String to be encrypted.
     *
     * @returns {object} Promise.
     */
    hashify(text) {
        return new Promise((resolve, reject) => {
            const genSaltFn = util.promisify(bcrypt.genSalt);
            const hashFn = util.promisify(bcrypt.hash);

            genSaltFn(10)
                .then(salt => hashFn(text, salt))
                .then(hash => resolve(hash))
                .catch(err => reject(err));
        });
    },

    /**
     * Compare input to reference hash.
     *
     * @param {string} value Input for comparison (password etc).
     * @param {string} hashRef Hash reference.
     * @param {*} success Promise resolve value.
     * @param {string} error Promise rejection value.
     *
     * @returns {object} Promise.
     */
    hashComparison(value, hashRef, success, error) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(value, hashRef, (err, isMatch) => {
                if (err) {
                    reject(err);
                } else if (!isMatch) {
                    reject(new APIError(error));
                } else {
                    resolve(success);
                }
            });
        });
    },

    /**
     * Utility function that receives a promise and then resolves the success
     * response to an array with the return data as second item. The error
     * received from catch response appears as the first item.
     *
     * Example usage (to be used in async function):
     *
     * [err, data] = await promiseExecution(promise);
     *
     * @param {object} promise Promise.
     *
     * @returns {array} Error data as first item, success data as second item.
     */
    promiseExecution(promise) {
        return promise.then(data => [null, data]).catch(err => [err]);
    }
};
