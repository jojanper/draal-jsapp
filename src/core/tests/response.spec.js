const ApiResponse = require('../response');


describe('ApiResponse', () => {
    it('jsonResponse', () => {
        let obj = new ApiResponse({errors: ['a']});
        let response = obj.jsonResponse;

        expect(response.errors.length).to.equal(1);
        expect(response.errors[0]).to.equal('a');

        obj = new ApiResponse();
        response = obj.jsonResponse;
        expect(Object.keys(response).length).to.equal(0);
    });
});
