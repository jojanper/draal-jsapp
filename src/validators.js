const util = require('util');
const validator = require('express-validator/check');


const VALIDATORS = {
    email: 'email'
};

/*
 * Predefined error messages for each validator type.
 */
const errorMessages = {};
errorMessages[VALIDATORS.email] = 'Not an email address';


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
     * Validator function corresponds to express-validator and actual validator
     * is dependent on input options.
     */
    get validator() {
        const cls = validator[this.options.api];

        switch (this.options.validator) {
        case 'email':
            // Simple email validator with predefined error message
            return cls(this.options.field, errorMessages[this.options.validator]).exists();

        default:
            break;
        }

        return null;
    }
}

module.exports = ValidatorAPI;
