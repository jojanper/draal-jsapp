/* eslint-disable no-unneeded-ternary */
const childProcess = require('child_process');
const fs = require('fs');
const bcrypt = require('bcrypt');
const util = require('util');
const path = require('path');
const { fdir: Fdir } = require('fdir');

const { APIError, APICmdError } = require('../error');
const ValidatorAPI = require('../validators');
const Wave = require('./wave');

const DEFAULT_HTTP_METHOD = 'post';

const pause = duration => new Promise(res => setTimeout(res, duration));

const retryPromise = (retries, fn, delay = 500) => fn().catch(err => ((retries > 1)
    ? pause(delay).then(() => retryPromise(retries - 1, fn, delay * 2)) : Promise.reject(err)));

function promiseExecution(promise) {
    return promise.then(data => [null, data]).catch(err => [err]);
}

function execute(cmd, cb, cbErr, options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        const execOptions = { ...options, windowsHide: true };
        const child = childProcess.exec(cmd, execOptions);

        // Live console output
        child.stdout.on('data', cb);

        child.stderr.on('data', cbErr);

        child.on('exit', code => {
            if (code !== 0) {
                return reject(code);
            }

            resolve(code);
        });
    });
}

/**
 * Async array filtering.
 *
 * @param {*} array Data to filter.
 * @param {*} predicate Async filter function.
 * @returns Promise that resolves to filtered array.
 */
async function asyncFilter(array, predicate) {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_v, index) => results[index]);
}

/**
 * Check if specified file path is directory.
 *
 * @param {*} file File path.
 * @returns Promise that resolves to directory status.
 */
async function isDirectory(file) {
    const promise = util.promisify(fs.stat);
    const [err, stat] = await promiseExecution(promise(file));
    return !err && stat.isDirectory();
}

/**
 * Filter specified files (string) array using given filtering conditions.
 */
async function getFilteredFiles(files, pathPrefix, { postfix, basename }) {
    // Is base path actually a directory
    let isDir = await isDirectory(pathPrefix);

    // If directory, then what is the file path separator used by the platform
    const subPrefix = isDir && !pathPrefix.endsWith(path.sep) ? path.sep : '';

    // Filter files
    const data = await asyncFilter(files, async file => {
        // Include if file ends with one of the specified patterns
        for (let i = 0; i < postfix.length; i++) {
            if (file.endsWith(postfix[i])) {
                return true;
            }
        }

        // Include if file basename starts with specified pattern
        if (basename) {
            const filename = path.basename(file);
            if (filename.startsWith(basename)) {
                return true;
            }
        }

        // Include directories
        isDir = await isDirectory(`${pathPrefix}${subPrefix}${file}`);
        if (isDir) {
            return true;
        }

        return !postfix;
    });

    // Add the base path to each file
    return data.map(file => `${pathPrefix}${subPrefix}${file}`);
}

/**
 * Get files listing from specified base path, subdir content is not included.
 */
async function getNonRecursiveFileListing(pathPrefix, options) {
    let prefix = pathPrefix;
    const promise = util.promisify(fs.readdir);
    let [err, files] = await promiseExecution(promise(pathPrefix));

    if (err !== null) {
        const pathPrefixUpper = path.dirname(pathPrefix);

        [err, files] = await promiseExecution(promise(pathPrefixUpper));
        if (err === null) {
            prefix = `${pathPrefixUpper}${path.sep}`;
            files = files.filter(file => `${prefix}${file}`.indexOf(pathPrefix) > -1);
        }
    }

    return (err === null) ? getFilteredFiles(files, prefix, options) : [];
}

/**
 * Get files listing from specified base path, subdir content is included.
 */
async function getRecursiveFileListing(pathPrefix, { postfix, basename }) {
    let api = new Fdir();

    if (postfix || basename) {
        api = api.filter(file => {
            // Include if file ends with one of the specified patterns
            for (let i = 0; i < postfix.length; i++) {
                if (file.endsWith(postfix[i])) {
                    return true;
                }
            }

            // Include if file basename starts with specified pattern
            if (basename) {
                const filename = path.basename(file);
                if (filename.startsWith(basename)) {
                    return true;
                }
            }

            return false;
        });
    }

    api = api.withFullPaths().crawl(pathPrefix);

    const [err, data] = await promiseExecution(api.withPromise());
    return (err === null) ? data : [];
}

/**
 * Get file listing from base path using given filtering conditions.
 *
 * @param {*} files Files array
 * @param {*} pathPrefix Base path of the files.
 * @param {*} options.postfix File ending pattern.
 * @param {*} options.basename File starting pattern.
 * @returns Promise that resolves to filtered files array.
 */
async function getFileListing(pathPrefix, options) {
    // Full file content is requested
    if (options && options.recursive) {
        return getRecursiveFileListing(pathPrefix, options);
    }

    // Only first level listing required
    return getNonRecursiveFileListing(pathPrefix, options);
}

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
        routes.forEach(route => {
            // Path of HTTP request
            const args = [route.cls.url];

            // Is authentication required
            if (route.cls.CLASSINFO.AUTHENTICATE) {
                args.push(middlewares.authFn);
            }

            // Include input validations, if available
            const validatorOptions = route.cls.VALIDATORS;
            if (validatorOptions && validatorOptions.length) {
                validatorOptions.forEach(option => {
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
    retryPromise,

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
    promiseExecution,

    /**
     * Execute specified function until it succeeds. Function is assumed to fail when
     * it returns null, non-null value indicates success.
     *
     * @param {*} timeout Timeout for execution retry, in milliseconds.
     * @param {*} dataCb Function to execute, no input parameters accepted.
     *
     * @returns Promise that resolves to whatever the executing function is returning on success.
     */
    retry(timeout, dataCb) {
        return new Promise(resolve => {
            timeout = timeout || 100;

            if (dataCb() !== null) {
                resolve(dataCb());
                return;
            }

            const retryFn = () => setTimeout(() => {
                const obj = dataCb();

                if (obj === null) {
                    retryFn();
                    return;
                }

                resolve(obj);
            }, timeout);

            retryFn();
        });
    },

    /**
     * Execute given shell command.
     *
     * @param {*} cmd Command to execute.
     * @param {*} options Command options.
     *
     * @returns Data from stdout.
     * @throws {APICmdError} Command execution failed.
     */
    async getExecData(cmd, options) {
        let error = false;
        let cmdData = '';
        const errMsg = [];

        const execData = await promiseExecution(execute(cmd, data => {
            cmdData += data;
        }, data => {
            // Check if underlying command failed due to unhandled (node) promise rejection
            if (data.indexOf('UnhandledPromise') > 0) {
                error = true;
            }

            errMsg.push(data.trim());
        }), options);

        if (execData[0] || error) {
            // Collect enough error info for the user
            const messages = [
                `Failed to execute: ${cmd}`,
            ];
            errMsg.forEach(msg => messages.push(msg));

            // Error will be handled in the middleware
            throw new APICmdError(messages);
        }

        return cmdData;
    },

    /**
     * Read specified file as JSON.
     *
     * @param {*} filepath Name of JSON file.
     *
     * @returns JSON data, null on failure.
     */
    async readJson(filepath) {
        const readFn = util.promisify(fs.readFile);
        const [err, data] = await promiseExecution(readFn(filepath));

        if (err) {
            return null;
        }

        return JSON.parse(data.toString('utf-8'));
    },

    /**
     * Check if specified file exists.
     *
     * @param {*} filePath Name of file.
     *
     * @returns Promise that resolves to true if file exists and false if file does not exist.
     */
    async fileExists(filePath) {
        const promise = util.promisify(fs.access)(filePath, fs.constants.F_OK);
        const response = await promiseExecution(promise);
        return !response[0];
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

    getFilteredFiles,
    getFileListing
};
