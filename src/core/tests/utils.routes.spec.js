/* eslint-disable no-unused-expressions */
const { serializeApiInfo } = require('../utils');
const { TestCtrl } = require('./ctrl.test');

describe('utils.routes', () => {
    it('supports serializeApiInfo', () => {
        const routes = [{ cls: TestCtrl }];

        expect(serializeApiInfo('', routes)[0]).to.have.keys([
            'url', 'method', 'info', 'authenticate', 'version', 'name'
        ]);
    });
});
