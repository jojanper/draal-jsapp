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
    }
};
