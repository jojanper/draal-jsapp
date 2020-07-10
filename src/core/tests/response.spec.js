const ApiResponse = require('../response');

describe('ApiResponse', () => {
    it('jsonResponse', () => {
        let obj = new ApiResponse({ errors: ['a'] });
        let response = obj.jsonResponse;

        expect(response.errors.length).to.equal(1);
        expect(response.errors[0]).to.equal('a');

        obj = new ApiResponse();
        response = obj.jsonResponse;
        expect(Object.keys(response).length).to.equal(0);

        obj = new ApiResponse({ cmdData: 'data0' });
        expect(obj.jsonResponse.cmddata).to.equal('data0');

        obj = new ApiResponse({ cmdErrors: 'error0' });
        expect(obj.jsonResponse.cmderrors).to.equal('error0');
    });

    it('fileResponse', () => {
        const obj = new ApiResponse({ file: 'a' });
        expect(obj.fileResponse).to.equal('a');
        expect(obj.hasFile).to.be.true;
    });
});
