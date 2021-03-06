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

    exec() {
        return this.query.exec();
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
     * Create new model instance.
     *
     * @param {object} params Model parameters.
     * @returns {Model}.
     */
    getNewModel(params) {
        const Model = this.model;
        return new Model(params);
    }

    /**
     * Execute query (promise and callback based).
     *
     * @param {string} method Query name.
     * @param {*} params Query parameters.
     * @param {function=} cb Callback function.
     * @returns {Query|Promise}.
     */
    execute(method, params, cb) {
        if (cb) {
            return this.model[method](params, cb);
        }

        return new DBQuery(this.model[method](params)).exec();
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
