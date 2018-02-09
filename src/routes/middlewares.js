const core = require('../core');

const BaseCtrl = core.ctrl;
const ApiResponse = core.response;

/**
 * Login required middleware.
 */
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    const ctrl = new BaseCtrl(req, res, next);
    ctrl.renderResponse(new ApiResponse({statusCode: 401}));
}

module.exports = {
    isAuthenticated
};
