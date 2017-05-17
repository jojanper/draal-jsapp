const router = require('express').Router();

module.exports = () => {
    // Application root/home page
    router.get('', (req, res) => {
        res.render('index', {title: 'Draal'});
    });

    return router;
};
