const ValidatorAPI = require('../validators');


describe('ValidatorAPI', () => {
    it('null is returned for unknown validator config', () => {
        const options = {
            api: ValidatorAPI.API.body,
            validators: ['unknown']
        };

        let obj = new ValidatorAPI(options);
        expect(obj.validator).to.equal(null);

        obj = new ValidatorAPI({api: ValidatorAPI.API.body});
        expect(obj.validator).to.equal(null);
    });
});
