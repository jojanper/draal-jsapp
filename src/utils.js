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
     * @param {object} router Router object
     * @param {array} routes List of routes to be included for application.
     *
     * @returns {object} Router object.
     */
    setRoutes(router, routes) {
        routes.forEach((route) => {
            router[route.method](route.url, route.fn);
        });

        return router;
    }
};
