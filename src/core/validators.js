const util = require('util');
const validator = require('express-validator/check');


const VALIDATORS = {
    email: 'email',
    exists: 'exists'
};

/*
 * Predefined error messages for each validator type.
 */
const errorMessages = {};
errorMessages[VALIDATORS.email] = 'Not an email address';
errorMessages[VALIDATORS.exists] = 'Must be present';


const createValidatorChain = (chain, validator) => {
    switch (validator) {
    case VALIDATORS.email:
        // Simple email validator
        return chain.isEmail().withMessage(errorMessages[validator]).trim().normalizeEmail();

    case VALIDATORS.exists:
        // Check that parameter exists
        return chain.exists().withMessage(errorMessages[validator]);

    default:
        break;
    }

    return null;
};

/**
 * Interface for handling input data validation and error reporting.
 * The constructor takes options as input and options describe all relevant
 * information how the validator should be constructed (such as field name,
 * what kind of validation chanin should be returned and so on).
 */
class ValidatorAPI {
    static get API() {
        return {
            body: 'body'
        };
    }

    static get VALIDATORS() {
        return VALIDATORS;
    }

    /**
     * Create error report from API call related to input data.
     *
     * @param {object} errors Mapped errors from express-validator.
     * @return {Array<string>} List of errors found from API input data.
     */
    static getErrors(errors) {
        const reportedErrors = [];
        Object.keys(errors).forEach((key) => {
            const msg = util.format('Input parameter %s: %s', key, errors[key].msg);
            reportedErrors.push(msg);
        });

        return reportedErrors;
    }

    constructor(options) {
        this.options = options;
    }

    /**
     * Create and return validator function to be used for HTTP requests.
     * Validator function corresponds to express-validator and actual validator chain
     * is dependent on input options.
     */
    get validator() {
        let chain = null;
        if (this.options.validators) {
            const cls = validator[this.options.api];
            chain = cls(this.options.field);

            this.options.validators.forEach((validator) => {
                chain = createValidatorChain(chain, validator);
            });
        }

        return chain;
    }
}

module.exports = ValidatorAPI;
