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
    it('supports sendRegistrationEmail', (done) => {
        const client = new MockCeleryClient();
        sinon.stub(celery, 'createClient').callsFake(() => client);

        // GIVEN Celery tasks execution is available
        process.env.CELERY_ON = true;
        CeleryClient.connect((client) => {
            const call = sinon.spy(client, 'call');

            // WHEN task is executed
            TasksLib.sendRegistrationEmail('test@test.com', 'abc');

            // THEN call to task scheduler is made
            sinon.assert.calledOnce(call);

            // AND Celery client receives task data
            expect(client.calls).to.be.equal(1);

            // AND Celery task data arguments are correct
            const args = call.getCalls()[0].args[1];
            expect(args[0]).to.be.equal('test@test.com');
            expect(args[1]).to.be.equal('abc');

            call.restore();
            celery.createClient.restore();

            delete process.env.CELERY_ON;

            CeleryClient.close().then(() => done());
        });
    }).timeout(3000);
});
