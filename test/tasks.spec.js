const sinon = require('sinon');
const celery = require('node-celery');

const CeleryClient = require('../config/celery');
const TasksLib = require('../src/tasks');


class MockCeleryClient {
    constructor() {
        this.calls = 0;
    }

    on(event, cb) {
        cb(this.calls);
    }

    once(event, cb) {
        cb(this.calls);
    }

    call() {
        this.calls++;
    }

    end() {
        this.calls = 0;
        return true;
    }
}

describe('Celery tasks', () => {
    it('supports executeTask', (done) => {
        const client = new MockCeleryClient();
        sinon.stub(celery, 'createClient').callsFake(() => client);

        // GIVEN Celery tasks execution is available
        process.env.CELERY_ON = true;
        CeleryClient.connect((client) => {
            const call = sinon.spy(client, 'call');

            // WHEN task is executed
            TasksLib.executeTask();

            // THEN call to task scheduler is made
            sinon.assert.calledOnce(call);

            // AND Celery client receives task data
            chai.expect(client.calls).to.be.equal(1);

            call.restore();
            celery.createClient.restore();

            delete process.env.CELERY_ON;

            CeleryClient.close().then(() => done());
        });
    }).timeout(3000);
});
