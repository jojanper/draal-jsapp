class APIError extends Error {
    /**
     * API error class.
     *
     * @param {string} message Error message
     * @constructor
     */
    constructor(message) {
        super(message);

        // Properly capture stack trace in Node.js
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    }
}

class APICmdError extends Error {
    /**
     * API error class for command execution related errors.
     *
     * @param {string} message Error message
     * @constructor
     */
    constructor(message) {
        super(message);

        // Properly capture stack trace in Node.js
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    }
}

module.exports = {
    APIError,
    APICmdError
};
