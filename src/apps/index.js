const apps = exports;

apps.core = require('./core');

apps.apiRoutes = [].concat(
    require('./user/ctrl')
);
