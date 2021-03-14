const ValidatorAPI = require('../validators');

const DEFAULT_HTTP_METHOD = 'post';

module.exports = {
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
    }
};
