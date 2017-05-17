module.exports = {
    isDevelopment(app) {
        return app.get('env') === 'development';
    },

    setRoutes(router, routes) {
        routes.forEach((route) => {
            router[route.method](route.url, route.fn);
        });

        return router;
    }
};
