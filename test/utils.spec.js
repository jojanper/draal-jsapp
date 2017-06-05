/* eslint-disable no-unused-expressions */
const utilsLib = require('src/utils');

class MockApp {
    constructor(mode) {
        this.mode = mode;
    }

    get() {
        return this.mode;
    }
}

describe('utilsLib', () => {
    it('supports isDevelopment', () => {
        let app = new MockApp('development');
        chai.expect(utilsLib.isDevelopment(app)).to.be.true;

        app = new MockApp('production');
        chai.expect(utilsLib.isDevelopment(app)).to.be.false;
    });

    it('supports serializeApiInfo', () => {
        const routes = [{
            url: '/foo',
            method: 'post'
        }];

        chai.expect(utilsLib.serializeApiInfo('', routes)[0]).to.have.keys(['url', 'method', 'info', 'authenticate']);
    });
});
