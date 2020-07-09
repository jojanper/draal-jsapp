const apps = exports;

apps.apiRoutes = [].concat(
    require('./user/ctrl'),
    require('./app')
);
