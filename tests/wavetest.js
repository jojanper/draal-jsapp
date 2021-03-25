const { promiseExecution, Wave } = require('../src/core/utils');

async function getWavInfo() {
    const [err, header] = await promiseExecution(Wave.WaveParser(process.argv[2]));
    if (err === null) {
        console.log(header);
    }

    console.log(err);
}

getWavInfo();
