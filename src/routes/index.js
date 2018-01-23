const router = require('express').Router();

const routes = exports;

routes.entry = () => {
    // Application root/home page
    router.get('', (req, res) => {
        res.render('index', {title: 'Draal'});
    });

    return router;
};

routes.api = require('./api');
