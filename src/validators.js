const validator = require('express-validator/check');

const errorMessages = {
    email: 'Not an email address'
};

class ValidatorAPI {
    constructor(options) {
        this.options = options;
    }

    get validator() {
        const cls = validator[this.options.method];

        switch (this.options.validator) {
        case 'email':
            return cls(this.options.field, errorMessages[this.options.validator]).exists();

        default:
            break;
        }

        return null;
    }
}

module.exports = ValidatorAPI;
