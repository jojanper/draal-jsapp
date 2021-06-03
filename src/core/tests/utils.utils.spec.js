/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const { asyncFilter } = require('../utils');

describe('utils.utils', () => {
    it('asyncFilter', async () => {
        const data = [1, -1, 2, -2, 3, -3];
        const filtered = await asyncFilter(data, item => item > 0);
        expect(filtered).to.eql([1, 2, 3]);
    });
});
