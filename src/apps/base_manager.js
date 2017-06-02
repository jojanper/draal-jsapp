class DBQuery {
    constructor(query) {
        this.query = query;
    }

    get getQuery() {
        return this.query;
    }

    set setQuery(query) {
        this.query = query;
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
     * @returns Promise to query, if no callback provided.
     */
    execute(method, params, cb) {
        if (cb) {
            return this.model[method](params, cb);
        }

        return this.model[method](params).exec();
    }

    /**
     * Get query object.
     *
     * @param {string} method Query name.
     * @param {*} params Query parameters.
     * @returns Promise to query.
     */
    query(method, params) {
        return this.model[method](params);
    }
}

module.exports = BaseManager;
