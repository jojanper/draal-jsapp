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
    retryPromise: retry
};
