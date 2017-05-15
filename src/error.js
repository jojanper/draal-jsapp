class APIError extends Error {
    /**
     * API error class.
     *
     * @param {String} message Error message
     * @constructor
     */
    constructor(message) {
        super(message);

        // properly capture stack trace in Node.js
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    }
}

module.exports = APIError;
