class DBQuery {
    constructor(query) {
        this.query = query;
    }

    getQuery() {
        return this.query;
    }

    setQuery(query) {
        this.query = query;
        return this;
    }

    exec(error) {
        return this.query.exec().catch(err => error(err));
    }
}

/**
 * Model manager, that is, interface through which MongoDB database
 * query operations are provided to Mongoose models.
 */
class BaseManager {
    constructor(model) {
        this.model = model;
    }

    /**
     * Execute query (promise and callback based).
     *
     * @param {string} method Query name.
     * @param {*} params Query parameters.
     * @param {function=} cb Callback function.
     * @param {function=} error Callback function for promise rejection.
     * @returns {Query|Promise}.
     */
    execute(method, params, cb, error) {
        if (cb) {
            return this.model[method](params, cb);
        }

        return new DBQuery(this.model[method](params)).exec(error);
    }

    /**
     * Get query object.
     *
     * @param {string} method Query name.
     * @param {*} params Query parameters.
     * @returns {DBQuery}.
     */
    queryObj(method, params) {
        return new DBQuery(this.model[method](params));
    }
}

module.exports = BaseManager;
