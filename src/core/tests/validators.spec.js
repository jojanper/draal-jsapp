const { expect } = require('chai');

const ValidatorAPI = require('../validators');

describe('ValidatorAPI', () => {
    it('null is returned for unknown validator config', async () => {
        const options = {
            api: ValidatorAPI.API.body,
            validators: ['unknown']
        };

        let obj = new ValidatorAPI(options);
        expect(obj.validator).to.equal(null);

        obj = new ValidatorAPI({ api: ValidatorAPI.API.body });
        expect(obj.validator).to.equal(null);
    });

    it('value validation', async () => {
        // GIVEN field must exist and be email address
        const obj = new ValidatorAPI({
            api: ValidatorAPI.API.body,
            validators: [ValidatorAPI.VALIDATORS.exists, ValidatorAPI.VALIDATORS.email],
            field: 'email'
        });

        // WHEN no value is present
        let promise = obj.validator.run({ body: {} }, '', {});
        let data = await promise;

        // THEN errors are present
        expect(data.errors[0].msg).to.equal('Must be present');
        expect(data.errors[1].msg).to.equal('Not an email address');

        // -----

        // WHEN valid email is specified
        promise = obj.validator.run({ body: { email: 'foo@gamil.com' } }, '', {});
        data = await promise;

        // THEN no errors are present
        expect(data.errors.length).to.equal(0);
    });

    it('optional value', async () => {
        // GIVEN optional field
        const obj = new ValidatorAPI({
            api: ValidatorAPI.API.body,
            validators: [ValidatorAPI.VALIDATORS.optional],
            field: 'opt'
        });

        // WHEN no value is present
        let promise = obj.validator.run({ body: {} }, '', {});
        let data = await promise;

        // THEN no errors are present
        expect(data.errors.length).to.equal(0);

        // -----

        // WHEN value is specified
        promise = obj.validator.run({ body: { opt: ['foobar'] } }, '', {});
        data = await promise;

        // THEN again no errors are present
        expect(data.errors.length).to.equal(0);
    });
});
