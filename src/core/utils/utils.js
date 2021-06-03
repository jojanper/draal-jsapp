/**
 * Async array filtering. Map each array item with filter function and execute via
 * Promise.all. Finally include results that produced true as return value.
 *
 * @param {array<*>} array Data to filter.
 * @param {*} predicate (Async) filter function.
 * @returns Promise that resolves to filtered array.
 */
async function asyncFilter(array, predicate) {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_v, index) => results[index]);
}

module.exports = {
    asyncFilter
};
