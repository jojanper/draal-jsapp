const util = require('util');
const validator = require('express-validator/check');

const APIError = require('src/error');
const ValidatorAPI = require('src/validators');


class BaseCtrl {

    /**
     * Derived class must implement this one
     * static get CLASSINFO() {}
     *
     * The following fields are supported:
     *
     * METHOD: HTTP method for the API. If not present, default method (POST) is used.
     * INFO: Class description.
     * VERSION: API version, optional.
     * NAME: URL for the API, unless URL exists. This field can be used
     * at the client side to resolve backend URLs.
     * URL: URL for the API, if not present NAME field is used.
     * URLPREFIX: URL prefix for the API.
     * AUTHENTICATE: Set to true if API requires authentication.
     */

    static get url() {
        const info = this.CLASSINFO;
        const version = (info.VERSION) ? util.format('/v%s', info.VERSION) : '';
        return util.format('/%s%s/%s', info.URLPREFIX, version, info.URL || info.NAME);
    }

    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    execute() {
        const obj = new Promise((resolve, reject) => {
            // First validate input parameters
            const errors = validator.validationResult(this.req);
            if (!errors.isEmpty()) {
                // Errors found, report back
                return reject(new APIError(ValidatorAPI.getErrors(errors.mapped())));
            }

            // Execute the API action
            this.action(resolve, (err) => {
                reject(err);
            });
        });

        // On success, render the action response
        // On failure, call the error handler
        obj
        .then(response => this.renderResponse(response))
        .catch(err => this.next(err));

        return this;
    }

    renderResponse(response) {
        let data = {};

        if (response) {
            const statusCode = response.statusCode;
            if (statusCode) {
                this.res.status(statusCode);
            }

            data = response.jsonResponse;
        }

        this.res.json(data);
        this.res.end();
    }

    static apiEntry() {
        const Cls = this;
        return (req, res, next) => new Cls(req, res, next).execute();
    }

    static serialize(urlPrefix, defaultMethod) {
        const info = this.CLASSINFO;

        const data = {
            url: util.format('%s%s', urlPrefix, this.url),
            method: info.METHOD || defaultMethod,
            info: info.INFO,
            authenticate: info.AUTHENTICATE || false,
            name: info.NAME
        };

        if (info.VERSION) {
            data.version = info.VERSION;
        }

        return data;
    }
}

module.exports = BaseCtrl;
