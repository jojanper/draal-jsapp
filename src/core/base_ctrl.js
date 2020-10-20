/* eslint-disable class-methods-use-this */
const util = require('util');
const validator = require('express-validator');

const { APIError } = require('./error');
const ValidatorAPI = require('./validators');

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

    /**
     * Execute controller action. The derived class is expected to provide the
     * implementation for the action. The action method is expected to return
     * a promise object. Promise resolve method must return Response instance whereas
     * promise reject method must return error either as APIError instance or some
     * Error instance.
     *
     * Before the actual action is executed, input parameter related errors are validated
     * to make sure that all relevant data is available.
     */
    execute() {
        const obj = new Promise((resolve, reject) => {
            // First validate input parameters
            const errors = validator.validationResult(this.req);
            if (!errors.isEmpty()) {
                // Errors found, report back
                return reject(new APIError(ValidatorAPI.getErrors(errors.mapped())));
            }

            // Execute the API action
            this.action()
                .then(resolve)
                .catch(reject);
        });

        // On success, render the action response
        // On failure, call the error handler
        obj
            .then(response => this.renderResponse(response))
            .catch(err => this.next(err));

        return obj;
    }

    renderResponse(response) {
        if (!response) {
            this.res.json({});
            this.res.end();
            return;
        }

        if (!response.hasFile) {
            if (response.statusCode) {
                this.res.status(response.statusCode);
            }

            this.res.json(response.jsonResponse);
            this.res.end();
            return;
        }

        this.res[this.hasDownloadQuery ? 'download' : 'sendFile'](response.fileResponse);
    }

    get hasDownloadQuery() {
        return this.getQueryParam('download');
    }

    hasQueryParam(param) {
        return Object.prototype.hasOwnProperty.call(this.req.query, param);
    }

    getQueryParam(param) {
        return decodeURIComponent(this.req.query[param]);
    }

    getParam(param) {
        return this.req.params[param];
    }

    getPostParam(param) {
        return this.req.body[param];
    }

    error(error) {
        throw new APIError(error);
    }

    static apiEntry() {
        const Cls = this;
        return (req, res, next) => new Cls(req, res, next).execute();
    }

    static serialize(urlPrefix, defaultMethod = 'post') {
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
