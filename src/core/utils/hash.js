const bcrypt = require('bcrypt');
const util = require('util');

const { APIError } = require('../error');

module.exports = {
    /**
     * Hash input string (password, etc).
     *
     * @param {string} text String to be encrypted.
     *
     * @returns {object} Promise.
     */
    hashify(text) {
        return new Promise((resolve, reject) => {
            const genSaltFn = util.promisify(bcrypt.genSalt);
            const hashFn = util.promisify(bcrypt.hash);

            genSaltFn(10)
                .then(salt => hashFn(text, salt))
                .then(hash => resolve(hash))
                .catch(err => reject(err));
        });
    },

    /**
     * Compare input to reference hash.
     *
     * @param {string} value Input for comparison (password etc).
     * @param {string} hashRef Hash reference.
     * @param {*} success Promise resolve value.
     * @param {string} error Promise rejection value.
     *
     * @returns {object} Promise.
     */
    hashComparison(value, hashRef, success, error) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(value, hashRef, (err, isMatch) => {
                if (err) {
                    reject(err);
                } else if (!isMatch) {
                    reject(new APIError(error));
                } else {
                    resolve(success);
                }
            });
        });
    }
};
