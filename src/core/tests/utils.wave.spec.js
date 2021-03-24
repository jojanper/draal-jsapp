const { expect } = require('chai');

const { Wave } = require('../utils');

describe('utils.Wave', () => {
    it('file info details', async () => {
        const data = await Wave.WaveParser('tests/test.wav');

        expect(data.id).to.equal('RIFF');
        expect(data.nChannels).to.equal(1);
        expect(data.sampleRate).to.equal(44100);
        expect(data.bitsPerSample).to.equal(16);
        expect(data.duration).to.equal(0.35);
    });
});
