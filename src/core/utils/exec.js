const childProcess = require('child_process');

const { APICmdError } = require('../error');

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

module.exports = {
    /**
     * Graceful re-try in the event of Promise failure.
     *
     * @param {number} retries Number of re-try attempts.
     * @param {function} fn Function that returns promise when called.
     * @param {number} [delay=500] Delay between re-try attemps in milliseconds.
     * @returns {object} Promise.
     */
    retryPromise,

    /**
     * Utility function that receives a promise and then resolves the success
     * response to an array with the return data as second item. The error
     * received from catch response appears as the first item.
     *
     * Example usage (to be used in async function):
     *
     * const [err, data] = await promiseExecution(promise);
     *
     * @param {object} promise Promise.
     * @returns {array} Error data as first item, success data as second item.
     */
    promiseExecution,

    /**
     * Execute specified function until it succeeds. Function is assumed to fail when
     * it returns null, non-null value indicates success.
     *
     * @param {*} timeout Timeout for execution retry, in milliseconds.
     * @param {*} dataCb Function to execute, no input parameters accepted.
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
        let cmdData = '';
        const errMsg = [];

        const execData = await promiseExecution(execute(cmd, data => {
            cmdData += data;
        }, data => errMsg.push(data.trim())), options);

        if (execData[0]) {
            // Collect enough error info for the user
            const messages = [
                `Failed to execute: ${cmd}`,
            ];
            errMsg.forEach(msg => messages.push(msg));

            // Error will be handled in the middleware
            throw new APICmdError(messages);
        }

        return cmdData;
    }
};
