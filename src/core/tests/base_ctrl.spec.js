/* eslint-disable no-unused-expressions */
const { expect } = require('chai');

const BaseCtrl = require('../base_ctrl');
const { TestCtrl } = require('./ctrl.test');

describe('BaseCtrl', () => {
    let jsonCount = 0;
    let endCount = 0;

    const req = {
        body: {
            paramA: 'a'
        },
        query: {
            queryA: 'qa',
            download: true
        },
        params: {
            paramsA: 'paramsA'
        }
    };

    const res = {
        json() {
            jsonCount += 1;
        },

        end() {
            endCount += 1;
        }
    };

    const ctrl = new BaseCtrl(req, res);

    it('supports getPostParam', () => {
        expect(ctrl.getPostParam('paramA')).to.equal('a');
    });

    it('supports getParam', () => {
        expect(ctrl.getParam('paramsA')).to.equal('paramsA');
    });

    it('supports query parameters', () => {
        expect(ctrl.hasDownloadQuery).to.be.not.undefined;
        expect(ctrl.hasQueryParam('queryAB')).to.be.false;
        expect(ctrl.getQueryParam('queryA')).to.equal('qa');
    });

    it('supports execute', async () => {
        const testCtrl = new TestCtrl(req, res);
        await testCtrl.execute();
        expect(jsonCount).to.equal(1);
        expect(endCount).to.equal(1);
    });

    it('supports serialize', () => {
        const data = TestCtrl.serialize('test-api');

        expect(data).to.have.keys([
            'url', 'method', 'info', 'authenticate', 'version', 'name'
        ]);

        expect(data.version).to.equal(1);
        expect(data.authenticate).to.be.false;
        expect(data.url).to.equal('test-api/test-url/v1/signup');
    });
});
