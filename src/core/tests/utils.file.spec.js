/* eslint-disable no-unused-expressions */
const {
    readJson, fileExists, isDirectory, getFileListing
} = require('../utils');

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

    it('getFileListing (no recursion)', async () => {
        let data;

        // Get file listing from file path
        data = await getFileListing('test');
        expect(data).to.eql([
            'test/.mocharc.js',
            'test/bootstrap.spec.js',
            'test/helpers.js',
            'test/sinon-mongoose',
            'test/test.wav',
            'test/wavetest.js'
        ]);

        // Get only directories from file path
        data = await getFileListing('tes', {
            basedir: true
        });
        expect(data).to.eql([
            './test'
        ]);
    });
});
