const ValidatorAPI = require('src/validators');


describe('ValidatorAPI', () => {
    it('null is returned for unknown validator config', () => {
        const options = {
            api: ValidatorAPI.API.body,
            validators: ['unknown']
        };

        let validator = new ValidatorAPI(options).validator;
        expect(validator).to.equal(null);

        validator = new ValidatorAPI({api: ValidatorAPI.API.body}).validator;
        expect(validator).to.equal(null);
    });
});
