/* eslint-disable no-unused-expressions */
const { retryPromise, retry, getExecData } = require('../utils');

describe('utils.exec', () => {
    it('supports retryPromise', done => {
        let retries = 0;

        retryPromise(2, () => new Promise((resolve, reject) => {
            retries++;
            reject(new Error('a'));
        })).catch(err => {
            expect(retries).to.equal(2);
            expect(err.message).to.equal('a');
            done();
        });
    });

    it('supports retry', async () => {
        let count = 0;

        // Data is ready after 2 timeout rounds
        const response = await retry(10, () => {
            if (count > 1) {
                return 111;
            }

            count++;
            return null;
        });

        expect(count).to.equal(2);
        expect(response).to.equal(111);

        // Data is ready immediately
        const response2 = await retry(undefined, () => 112);
        expect(response2).to.equal(112);
    });

    it('supports getExecData', async () => {
        // 'ls' command execution succeeds
        let data = await getExecData('ls');
        expect(data.length > 1).to.be.true;

        // Failed command execution
        try {
            data = await getExecData('foobar');
        } catch (err) {
            // Error message is available
            expect(err.message.length).to.equal(2);
            return Promise.resolve();
        }
    });
});
