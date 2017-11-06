const ValidatorAPI = require('src/validators');


describe('ValidatorAPI', () => {
    it('null is returned for unknown validator config', () => {
        const options = {
            api: ValidatorAPI.API.body
        };

        const validator = new ValidatorAPI(options).validator;
        expect(validator).to.equal(null);
    });
});
