/**
 * Async array filtering.
 *
 * @param {*} array Data to filter.
 * @param {*} predicate Async filter function.
 * @returns Promise that resolves to filtered array.
 */
async function asyncFilter(array, predicate) {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_v, index) => results[index]);
}

module.exports = {
    asyncFilter
};
