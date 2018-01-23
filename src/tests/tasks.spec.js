const sinon = require('sinon');
const celery = require('node-celery');

const CeleryClient = require('../../config').celery;
const TasksLib = require('../tasks');


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
    const mockClient = new MockCeleryClient();

    beforeEach((done) => {
        process.env.CELERY_ON = true;
        sinon.stub(celery, 'createClient').callsFake(() => mockClient);
        done();
    });

    afterEach((done) => {
        celery.createClient.restore();
        delete process.env.CELERY_ON;
        done();
    });

    function connect() {
        return new Promise((resolve) => {
            CeleryClient.connect((client) => {
                resolve(client);
            });
        });
    }

    function close(mockCall, done) {
        mockCall.restore();
        CeleryClient.close().then(() => done());
    }

    it('supports sendRegistrationEmail', (done) => {
        // GIVEN Celery tasks execution is available
        connect().then((client) => {
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

            close(call, done);
        });
    }).timeout(3000);

    it('supports sendPasswordResetEmail', (done) => {
        // GIVEN Celery tasks execution is available
        connect().then((client) => {
            const call = sinon.spy(client, 'call');

            // WHEN task is executed
            TasksLib.sendPasswordResetEmail('test@test.com', 'abc');

            // THEN call to task scheduler is made
            sinon.assert.calledOnce(call);

            // AND Celery client receives task data
            expect(client.calls).to.be.equal(1);

            // AND Celery task data arguments are correct
            const args = call.getCalls()[0].args[1];
            expect(args[0]).to.be.equal('test@test.com');
            expect(args[1]).to.be.equal('abc');

            close(call, done);
        });
    }).timeout(3000);
});
