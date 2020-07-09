/* eslint-disable no-unused-expressions */

describe('App API', () => {
    const uploadApi = '/api/app/media-upload';
    const metaApi = '/api/app/metadata';

    it('media file upload is supported', done => {
        const imgPath = `${__dirname}/../../../../favicon.png`;
        const request = testrunner(testapp).post(uploadApi).attach('file', imgPath);

        request.expect(200).end((err, res) => {
            expect(res.body.cmddata.length > 0).to.be.true;
            done(err);
        });
    });

    it('app metadata query is supported', done => {
        testrunner(testapp).get(metaApi).expect(200)
            .end((err, res) => {
                expect(Object.keys(res.body.data)).to.have.all.members([
                    'version'
                ]);
                done(err);
            });
    });
});
