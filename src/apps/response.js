class Response {
    constructor({data = null, errors = null, messages = null, statusCode = null} =
        {data: null, errors: null, messages: null, statusCode: null}) {
        this._data = data;
        this._errors = errors;
        this._messages = messages;
        this._statusCode = statusCode;
    }

    get jsonResponse() {
        const response = {};

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
