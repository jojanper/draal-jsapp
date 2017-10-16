/* eslint-disable no-unused-expressions */
const UtilsLib = require('src/utils');
const bcrypt = require('bcrypt');
const sinon = require('sinon');

const ApiCtrl = require('../src/apps/user/ctrl')[0];

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
        const routes = [ApiCtrl];

        expect(UtilsLib.serializeApiInfo('', routes)[0]).to.have.keys([
            'url', 'method', 'info', 'authenticate', 'version', 'name'
        ]);
    });

    it('supports retryPromise', (done) => {
        let retries = 0;

        UtilsLib.retryPromise(2, () =>
            new Promise((resolve, reject) => {
                retries++;
                reject('a');
            })
        )
        .catch((err) => {
            expect(retries).to.equal(2);
            expect(err).to.equal('a');
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
            .catch((err) => {
                bcrypt.hash.restore();
                expect(err.name).to.be.equal(errMsg.name);
            });
    });
});
