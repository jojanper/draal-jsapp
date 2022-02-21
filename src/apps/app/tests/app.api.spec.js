/* eslint-disable no-unused-expressions */
const fs = require('fs');
const { promisify } = require('util');

describe('App API', () => {
    const imgPath = `${__dirname}/../../../../favicon.png`;
    const uploadApi = '/api/app/media-upload';
    const downloadApi = '/api/app/media-download/favicon.png';
    const metaApi = '/api/app/metadata';
    const closeApi = '/api/app/close';

    it('media file upload is supported', done => {
        const request = testrunner(testapp).post(uploadApi)
            .attach('file0', imgPath)
            .attach('file1', imgPath)
            .field('data', 'test-data')
            .field('data2', JSON.stringify({ key: 'value' }));

        request.expect(200).end((err, res) => {
            expect(res.body.cmddata.length > 0).to.be.true;
            done(err);
        });
    });

    it('media file download is supported', async () => {
        const readFile = promisify(fs.readFile);
        const img = await readFile(imgPath);

        const request = testrunner(testapp).get(downloadApi);
        const res = await request.expect(200);
        expect(res.body.toString()).equal(img.toString());
    });

    it('invalid command query for media file upload', done => {
        const url = `${uploadApi}?cmd=aa`;
        const request = testrunner(testapp).post(url).attach('file', imgPath);

        request.expect(400).end((err, res) => {
            expect(res.body.errors.length > 0).to.be.true;
            done(err);
        });
    });

    it('media file upload fails', done => {
        const request = testrunner(testapp).post(uploadApi);
        request.expect(400).end((err, res) => {
            expect(res.body.errors.length > 0).to.be.true;
            done(err);
        });
    });

    it('app metadata query is supported', done => {
        testrunner(testapp).get(metaApi).expect(200).end((err, res) => {
            expect(Object.keys(res.body.data)).to.have.all.members([
                'version', 'tempfile'
            ]);
            done(err);
        });
    });

    it('app is closed', done => {
        testrunner(testapp).post(closeApi).expect(200).end(done);
    });
});
