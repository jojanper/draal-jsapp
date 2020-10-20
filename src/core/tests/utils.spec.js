/* eslint-disable no-unused-expressions */
const bcrypt = require('bcrypt');
const sinon = require('sinon');

const UtilsLib = require('../utils');
const { TestCtrl } = require('./ctrl.test');

class MockApp {
    constructor(mode) {
        this.mode = mode;
    }

    get() {
        return this.mode;
    }
}

describe('utilsLib', () => {
    it('supports isString', () => {
        expect(UtilsLib.isString({})).to.be.false;
        expect(UtilsLib.isString('fas')).to.be.true;
    });

    it('supports isObject', () => {
        const obj = { a: 1 };
        expect(UtilsLib.isObject(obj)).to.be.true;
        expect(UtilsLib.isObject('fas')).to.be.false;
        expect(UtilsLib.isObject([])).to.be.false;
    });

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

    it('supports readJson', async () => {
        let data = await UtilsLib.readJson(`${__dirname}/../../../package.json`);
        expect(data.version.split('.').length).to.equal(3);

        data = await UtilsLib.readJson('foo.bar');
        expect(data).to.equal(null);
    });

    it('supports fileExist', async () => {
        let status = await UtilsLib.fileExists(`${__dirname}/../../../package.json`);
        expect(status).to.be.true;

        status = await UtilsLib.fileExists('foo.bar');
        expect(status).to.be.false;
    });

    it('supports getExecData', async () => {
        // 'ls' command execution succeeds
        let data = await UtilsLib.getExecData('ls');
        expect(data.length > 1).to.be.true;

        // Failed command execution
        try {
            data = await UtilsLib.getExecData('foobar');
        } catch (err) {
            // Error message is available
            expect(err.message.length).to.equal(2);
            return Promise.resolve();
        }
    });
});
