/**
 * Model manager, that is, interface through which MongoDB database
 * query operations are provided to Mongoose models.
 */
class BaseManager {
    constructor(model) {
        this.model = model;
    }

}

module.exports = BaseManager;
