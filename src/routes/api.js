const router = require('express').Router();
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const bodyParser = require('body-parser');

const core = require('../core');
const { apiRoutes } = require('../apps');
const { isAuthenticated } = require('./middlewares');
const { schema } = require('../graphql');

const APIError = core.error;
const utilsLib = core.utils;
const BaseCtrl = core.ctrl;
const ApiResponse = core.response;

module.exports = (prefix) => {
    router.get('', (req, res) => {
        const ctrl = new BaseCtrl(req, res);
        const data = utilsLib.serializeApiInfo(prefix, apiRoutes);
        ctrl.renderResponse(new ApiResponse({data}));
    });

    // GraphQL endpoint and interactive editor
    router.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
        schema,
        context: {user: request.session.passport.user}
    })));
    router.get('/graphiql', graphiqlExpress({endpointURL: `${prefix}/graphql`}));

    router.get('/error', () => {
        throw new APIError('API error occured');
    });

    router.get('/unhandled-error', () => {
        throw new Error('Application is not expected to handle this error');
    });

    utilsLib.setRoutes(router, apiRoutes, {
        authFn: isAuthenticated
    });

    return router;
};
