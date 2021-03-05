const apps = exports;

apps.apiRoutes = [].concat(
    require('./user/ctrl'),
    require('./media'),
    require('./app')
);
