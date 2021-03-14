/* eslint-disable no-unused-expressions */
const { readJson, fileExists } = require('../utils');

describe('utilsLib', () => {
    it('supports readJson', async () => {
        let data = await readJson(`${__dirname}/../../../package.json`);
        expect(data.version.split('.').length).to.equal(3);

        data = await readJson('foo.bar');
        expect(data).to.equal(null);
    });

    it('supports fileExist', async () => {
        let status = await fileExists(`${__dirname}/../../../package.json`);
        expect(status).to.be.true;

        status = await fileExists('foo.bar');
        expect(status).to.be.false;
    });
});
