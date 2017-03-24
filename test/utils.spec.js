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
    it('should support isDevelopment', () => {
        let app = new MockApp('development');
        chai.expect(utilsLib.isDevelopment(app)).to.be.true;

        app = new MockApp('production');
        chai.expect(utilsLib.isDevelopment(app)).to.be.false;
    });
});
