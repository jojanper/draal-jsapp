const childProcess = require('child_process');

function execute(cmd) {
    return new Promise((resolve, reject) => {
        const child = childProcess.spawn(cmd, {
            shell: true,
            stdio: 'inherit'
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
