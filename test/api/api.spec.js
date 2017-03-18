describe('GET /api', () => {
    it('should return HTTP 200', (done) => {
        testrunner(testapp).get('/api').expect(200)
            .end((err, res) => {
                chai.expect(res.body).to.have.keys(['foo']);
                done(err);
            });
    });
});
