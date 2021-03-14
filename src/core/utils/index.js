/* eslint-disable no-unneeded-ternary */
const Wave = require('./wave');
const exec = require('./exec');
const utils = require('./utils');
const file = require('./file');
const hash = require('./hash');
const routes = require('./routes');

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
     * Is specified parameter a string.
     *
     * @param {*} str Input object.
     *
     * @returns true if string, false otherwise.
     */
    isString: str => (typeof str === 'string' || str instanceof String),

    /**
     * Is specified parameter an object.
     *
     * @param {*} obj Input object.
     *
     * @returns true if object, false otherwise.
     */
    isObject: obj => (((typeof obj === 'object') && obj !== null && !Array.isArray(obj)) ? true : false),

    /**
     * Return name prefix for backend API calls.
     */
    getApiPrefix: () => process.env.APIPREFIX || '/api',

    Wave,

    ...exec,
    ...utils,
    ...file,
    ...hash,
    ...routes
};
