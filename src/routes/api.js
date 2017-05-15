const router = require('express').Router();
const APIError = require('../error');


router.get('', (req, res) => {
    res.json({foo: 'bar'});
});

router.get('/error', () => {
    throw new APIError('API error occured');
});

router.get('/unhandled-error', () => {
    throw new Error('Application is not expected to handle this error');
});

module.exports = router;
