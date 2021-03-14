/* eslint-disable no-unused-expressions */
const { readJson, fileExists, isDirectory } = require('../utils');

const packageJson = `${__dirname}/../../../package.json`;

describe('utils.file', () => {
    it('readJson', async () => {
        let data = await readJson(packageJson);
        expect(data.version.split('.').length).to.equal(3);

        data = await readJson('foo.bar');
        expect(data).to.equal(null);
    });

    it('fileExist', async () => {
        let status = await fileExists(packageJson);
        expect(status).to.be.true;

        status = await fileExists('foo.bar');
        expect(status).to.be.false;
    });

    it('isDirectory', async () => {
        const status = await isDirectory(packageJson);
        expect(status).to.be.false;
    });
});
