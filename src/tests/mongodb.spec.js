const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = require('chai');

const { mongo } = require('../../config');

describe('Mongo connection', () => {
    it('error is thrown if no connection established', done => {
        const URI = process.env.MONGODB_URI;
        const uri = `${URI}`;

        sinon.stub(mongoose, 'connect').callsFake((p1, p2, cb) => {
            cb('err');
        });

        try {
            mongo.config(mongoose, () => {
                done();
            }, { retry: 0, uri });
        } catch (err) {
            expect(err.message).to.equal('MongoDB connection failure, aborting.');
            mongoose.connect.restore();
            done();
        }
    });
});
