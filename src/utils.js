module.exports = {
    isDevelopment(app) {
        return app.get('env') === 'development';
    }
};
