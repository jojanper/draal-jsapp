class Response {
    /* eslint-disable indent */
    constructor({
        data = null, errors = null, messages = null, statusCode = null, file = null,
        cmdData = null, cmdErrors = null
    } = {
            data: null,
            errors: null,
            messages: null,
            statusCode: null,
            file: null,
            cmdData: null,
            cmdErrors: null
        }) {
        /* eslint-enable indent */
        this._data = data;
        this._errors = errors;
        this._messages = messages;
        this._statusCode = statusCode;
        this._file = file;
        this._cmdData = cmdData;
        this._cmdErrors = cmdErrors;
    }

    get hasFile() {
        return this._file ? true : false;
    }

    get fileResponse() {
        return this._file;
    }

    get jsonResponse() {
        const response = {};

        if (this._cmdData) {
            response.cmddata = this._cmdData;
        }

        if (this._cmdErrors) {
            response.cmderrors = this._cmdErrors;
        }

        if (this._errors) {
            response.errors = this._errors;
        }

        if (this._messages) {
            response.messages = this._messages;
        }

        if (this._data) {
            response.data = this._data;
        }

        return response;
    }

    get statusCode() {
        return this._statusCode;
    }
}

module.exports = Response;
