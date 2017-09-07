const bcrypt = require('bcrypt-nodejs');
const util = require('util');


const pause = duration => new Promise(res => setTimeout(res, duration));

const retry = (retries, fn, delay = 500) =>
  fn().catch(err => ((retries > 1) ?
    pause(delay).then(() => retry(retries - 1, fn, delay * 2))
    : Promise.reject(err)));


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
     * @param {function} authFn Authentication middleware.
     *
     * @returns {object} Router object.
     */
    setRoutes(router, routes, authFn) {
        routes.forEach((route) => {
            const args = [route.url];

            if (route.authenticate) {
                args.push(authFn);
            }

            args.push(route.fn);

            router[route.method](...args);
        });

        return router;
    },

    /**
     * Serialize API routes.
     *
     * @param {string} prefix Prefix URL for routes.
     * @param {array} routes List of API routes.
     *
     * @returns {object} Serialized API data.
     */
    serializeApiInfo(prefix, routes) {
        return routes.map((item) => {
            const data = {
                url: prefix + item.url,
                method: item.method,
                info: item.info || '',
                authenticate: item.authenticate || false
            };

            return data;
        });
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
                .then(salt => hashFn(text, salt, null))
                .then(hash => resolve(hash))
                .catch(err => reject(err));
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
