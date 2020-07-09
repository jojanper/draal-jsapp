/* eslint-disable no-unused-expressions */
const bcrypt = require('bcrypt');
const sinon = require('sinon');

const UtilsLib = require('../utils');
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
            URLPREFIX: '/test-url'
        };
    }
}

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
        expect(UtilsLib.isDevelopment(app)).to.be.true;

        app = new MockApp('production');
        expect(UtilsLib.isDevelopment(app)).to.be.false;
    });

    it('supports serializeApiInfo', () => {
        const routes = [{ cls: TestCtrl }];

        expect(UtilsLib.serializeApiInfo('', routes)[0]).to.have.keys([
            'url', 'method', 'info', 'authenticate', 'version', 'name'
        ]);
    });

    it('supports retryPromise', done => {
        let retries = 0;

        UtilsLib.retryPromise(2, () => new Promise((resolve, reject) => {
            retries++;
            reject(new Error('a'));
        })).catch(err => {
            expect(retries).to.equal(2);
            expect(err.message).to.equal('a');
            done();
        });
    });

    it('hash creation fails', () => {
        const errMsg = new Error('Error message');

        // Hash for given string is set to fail
        sinon.stub(bcrypt, 'hash').callsFake((p1, p2, cb) => {
            cb(errMsg, null);
        });

        // Error must be present when hashing string
        return UtilsLib.hashify('test')
            .catch(err => {
                bcrypt.hash.restore();
                expect(err.name).to.be.equal(errMsg.name);
            });
    });

    it('supports retry', async () => {
        let count = 0;

        // Data is ready after 2 timeout rounds
        const response = await UtilsLib.retry(10, () => {
            if (count > 1) {
                return 111;
            }

            count++;
            return null;
        });

        expect(count).to.equal(2);
        expect(response).to.equal(111);

        // Data is ready immediately
        const response2 = await UtilsLib.retry(undefined, () => 112);
        expect(response2).to.equal(112);
    });
});
