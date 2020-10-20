const childProcess = require('child_process');

function execute(cmd, cbStdout) {
    return new Promise((resolve, reject) => {
        const child = childProcess.exec(cmd);

        // Live console output
        child.stdout.on('data', data => {
            console.log(data.trim());
            if (cbStdout) {
                cbStdout(data);
            }
        });

        child.stderr.on('data', data => {
            console.log(data.trim());
        });

        child.on('exit', code => {
            if (code !== 0) {
                return reject(code);
            }

            resolve(code);
        });
    });
}

module.exports = {
    execute
};
