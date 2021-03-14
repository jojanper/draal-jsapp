/* eslint-disable no-unused-expressions */
const { isString, isDevelopment, isObject } = require('../utils');

class MockApp {
    constructor(mode) {
        this.mode = mode;
    }

    get() {
        return this.mode;
    }
}

describe('utils', () => {
    it('supports isString', () => {
        expect(isString({})).to.be.false;
        expect(isString('fas')).to.be.true;
    });

    it('supports isObject', () => {
        const obj = { a: 1 };
        expect(isObject(obj)).to.be.true;
        expect(isObject('fas')).to.be.false;
        expect(isObject([])).to.be.false;
    });

    it('supports isDevelopment', () => {
        let app = new MockApp('development');
        expect(isDevelopment(app)).to.be.true;

        app = new MockApp('production');
        expect(isDevelopment(app)).to.be.false;
    });
});
