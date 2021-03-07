const fs = require('fs');
const util = require('util');

// First 40 bytes are RIFF header
const WAVEHEADERSIZE = 40;

// Header tags to be parsed
const WAVETAGS = [
    ['id', 'string', 4, true],
    ['idSize', 'uinteger', 4, true],
    ['formatTag', 'string', 4, true],
    ['fmtId', 'string', 4, true],
    ['fmtIdSize', 'integer', 4, false],
    ['formatTag', 'integer', 2, true],
    ['nChannels', 'integer', 2, true],
    ['sampleRate', 'uinteger', 4, true],
    ['byte_rate', 'integer', 4, true],
    ['blockAlign', 'integer', 2, true],
    ['bitsPerSample', 'integer', 2, true],
    ['dataId', 'string', 4, true]
];

/**
 * Parse WAVE info from specified file.
 *
 * @param {*} filename WAVE file path.
 * @returns WAVE info object.
 */
async function WaveParser(filename) {
    const header = {};

    const fd = await util.promisify(fs.open)(filename, 'r');

    async function parseHeader() {
        const buffer = Buffer.alloc(WAVEHEADERSIZE);
        await util.promisify(fs.read)(fd, buffer, 0, WAVEHEADERSIZE, 0);

        let readIndex = 0;
        WAVETAGS.forEach(item => {
            if (item[3] === true) {
                if (item[1] === 'string') {
                    header[item[0]] = buffer.toString('ascii', readIndex, readIndex + item[2]);
                } else if (item[1] === 'integer') {
                    header[item[0]] = buffer.readUInt16LE(readIndex, item[2]);
                } else if (item[1] === 'uinteger') {
                    header[item[0]] = buffer.readInt32LE(readIndex, item[2]);
                }
            }
            readIndex += item[2];
        });
        const bytesPerSample = header.bitsPerSample / 8;
        const bytesPerSec = header.nChannels * header.sampleRate * bytesPerSample;
        header.duration = parseFloat((header.idSize / bytesPerSec).toFixed(2), 10);
    }

    await parseHeader();
    await util.promisify(fs.close)(fd);

    return header;
}

module.exports = {
    WaveParser
};
