/* eslint-disable class-methods-use-this */
const BaseCtrl = require('../base_ctrl');

/**
 * Create API entry point for testing.
 */
class TestCtrl extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'User sign-up',
            VERSION: 1,
            NAME: 'signup',
            URLPREFIX: 'test-url'
        };
    }

    async action() {
        return 'success';
    }
}

module.exports = {
    TestCtrl
};
