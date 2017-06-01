describe('GET /api', () => {
    it('should list all available APIs', (done) => {
        testrunner(testapp).get('/api').expect(200).end((err, res) => {
            chai.expect(res.body.length).to.be.equal(4);
            done(err);
        });
    });
});

describe('API error handling', () => {
    it('should catch application error', (done) => {
        testrunner(testapp).get('/api/error').expect(400).end((err, res) => {
            chai.expect(res.body).to.have.keys(['errors']);
            chai.expect(res.body.errors[0]).to.equal('API error occured');
            done(err);
        });
    });

    it('should not catch system errors', (done) => {
        testrunner(testapp).get('/api/unhandled-error').expect(500).end((err) => {
            done(err);
        });
    });
});
