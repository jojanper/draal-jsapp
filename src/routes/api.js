const router = require('express').Router();
const APIError = require('../error');
const utilsLib = require('../utils');

// User registration and authentication APIs
const userAPIs = require('../apps/user/ctrl');

/**
 * Login required middleware.
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      console.log('next');
      return next();
  }

  console.log('NOT LOGGED IN');

  res.status(401);
  res.json();
  res.end();
}

module.exports = () => {
    router.get('', (req, res) => {
        res.json({foo: 'bar'});
    });

    router.get('/error', () => {
        throw new APIError('API error occured');
    });

    router.get('/unhandled-error', () => {
        throw new Error('Application is not expected to handle this error');
    });

    utilsLib.setRoutes(router, userAPIs, isAuthenticated);

    return router;
};
