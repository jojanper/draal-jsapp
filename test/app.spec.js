describe('GET /', () => {
    it('should return HTTP 200', (done) => {
        testrunner(testapp).get('/').expect(200, done);
    });
});

describe('GET /foo', () => {
    it('should return HTTP 404', (done) => {
        testrunner(testapp).get('/foo').expect(404, done);
    });
});
