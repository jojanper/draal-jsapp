/* eslint-disable no-unused-expressions */
const UtilsLib = require('src/utils');

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
        chai.expect(UtilsLib.isDevelopment(app)).to.be.true;

        app = new MockApp('production');
        chai.expect(UtilsLib.isDevelopment(app)).to.be.false;
    });

    it('supports serializeApiInfo', () => {
        const routes = [{
            url: '/foo',
            method: 'post'
        }];

        chai.expect(UtilsLib.serializeApiInfo('', routes)[0]).to.have.keys(['url', 'method', 'info', 'authenticate']);
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
            chai.expect(retries).to.equal(2);
            chai.expect(err).to.equal('a');
            done();
        });
    });
});
