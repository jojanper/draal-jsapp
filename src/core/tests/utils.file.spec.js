/* eslint-disable no-unused-expressions */
const path = require('path');

const {
    readJson, fileExists, isDirectory, getFileListing
} = require('../utils');

const packageJson = `${__dirname}/../../../package.json`;
const basePath = process.cwd();

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

    function getFullPath(postfix) {
        return path.join(basePath, postfix);
    }

    it('getFileListing (no recursion)', async () => {
        let data;

        data = await getFileListing('tests-2');
        expect(data).to.eql([]);

        data = await getFileListing('tests2/e');
        expect(data).to.eql([
        ]);

        data = await getFileListing('tests/e');
        expect(data).to.eql([
            'tests/e2e'
        ]);

        // Get file listing from file path
        data = await getFileListing('tests');
        expect(data).to.eql([
            'tests/.mocharc.js',
            'tests/bootstrap.spec.js',
            'tests/e2e',
            'tests/helpers.js',
            'tests/sinon-mongoose',
            'tests/test.wav',
            'tests/wavetest.js'
        ]);

        // Get only directories from file path
        data = await getFileListing('tests', {
            nodot: true,
            onlydir: true
        });
        expect(data).to.eql([
            'tests/e2e',
            'tests/sinon-mongoose'
        ]);

        // Directories and file extensions that end with specified pattern
        data = await getFileListing('tests', {
            nodot: true,
            postfix: ['.js', '.wav']
        });
        expect(data).to.eql([
            'tests/bootstrap.spec.js',
            'tests/e2e',
            'tests/helpers.js',
            'tests/sinon-mongoose',
            'tests/test.wav',
            'tests/wavetest.js'
        ]);

        // Filenames that start with specified pattern
        data = await getFileListing('tests', {
            basename: ['bootstrap', 'helpers']
        });
        expect(data).to.eql([
            'tests/bootstrap.spec.js',
            'tests/helpers.js'
        ]);

        // Directories and filenames that start with specified pattern
        data = await getFileListing('tests', {
            withdir: true,
            basename: ['bootstrap', 'helpers']
        });
        expect(data).to.eql([
            'tests/bootstrap.spec.js',
            'tests/e2e',
            'tests/helpers.js',
            'tests/sinon-mongoose'
        ]);
    });

    it('getFileListing (recursion)', async () => {
        let data;

        // File path does not exist
        data = await getFileListing('tests-2', {
            recursive: true
        });
        expect(data).to.eql([]);

        // File path is not a directory
        data = await getFileListing('tests/helpers.js', {
            recursive: true,
            basedir: true
        });
        expect(data).to.eql([]);

        // Files that start or end with specified patterns
        data = await getFileListing('tests', {
            recursive: true,
            basedir: true,
            basename: ['i'],
            postfix: ['.wav']
        });
        expect(data).to.eql([
            getFullPath('tests/test.wav'),
            getFullPath('tests/sinon-mongoose/index.js'),
            getFullPath('tests/e2e/plugins/index.js'),
            getFullPath('tests/e2e/support/index.js')
        ]);

        data = await getFileListing('tests', {
            recursive: true,
            basedir: true,
            postfix: ['.js']
        });
        expect(data).to.have.members([
            getFullPath('tests/.mocharc.js'),
            getFullPath('tests/bootstrap.spec.js'),
            getFullPath('tests/helpers.js'),
            getFullPath('tests/wavetest.js'),
            getFullPath('tests/sinon-mongoose/index.js'),
            getFullPath('tests/e2e/plugins/index.js'),
            getFullPath('tests/e2e/specs/home.js'),
            getFullPath('tests/e2e/support/commands.js'),
            getFullPath('tests/e2e/support/index.js')
        ]);

        // Get file listing from file path
        data = await getFileListing('tests', {
            recursive: true
        });
        expect(data).to.have.members([
            getFullPath('tests/.mocharc.js'),
            getFullPath('tests/bootstrap.spec.js'),
            getFullPath('tests/helpers.js'),
            getFullPath('tests/test.wav'),
            getFullPath('tests/wavetest.js'),
            getFullPath('tests/sinon-mongoose/index.js'),
            getFullPath('tests/e2e/plugins/index.js'),
            getFullPath('tests/e2e/specs/home.js'),
            getFullPath('tests/e2e/support/commands.js'),
            getFullPath('tests/e2e/support/index.js')
        ]);
    });
});
