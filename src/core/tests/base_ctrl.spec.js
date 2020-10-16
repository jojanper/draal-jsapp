/* eslint-disable no-unused-expressions */
const BaseCtrl = require('../base_ctrl');

describe('BaseCtrl', () => {
    const req = {
        body: {
            paramA: 'a'
        },
        query: {
            queryA: 'qa',
            download: true
        }
    };

    const ctrl = new BaseCtrl(req);

    it('supports getPostParam', () => {
        expect(ctrl.getPostParam('paramA')).to.equal('a');
    });

    it('supports query parameters', () => {
        expect(ctrl.hasDownloadQuery).to.be.not.undefined;
        expect(ctrl.hasQueryParam('queryAB')).to.be.false;
        expect(ctrl.getQueryParam('queryA')).to.equal('qa');
    });
});
