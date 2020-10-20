const { execute } = require('../utils');

const packageJson = require('../../package.json');

async function zipApp(cmdOptions) {
    const binary = `${cmdOptions.binary}_${packageJson.version}_${process.platform}.zip`;

    const cmd = [
        `cd ${cmdOptions.folder}`,
        `rm -rf ../${binary}`,
        `cmake -E tar cfv ../${binary} --format=zip .`
    ].join(' && ');

    console.log(cmd);
    await execute(cmd);
}

module.exports = program => {
    program
        .command('zip-app')
        .description('Packetize application to zip format')
        .option('--folder <folder>', 'Source folder', 'builds/draaljsapp-win32-x64')
        .option('--binary <binary>', 'Target binary name', 'draaljsapp')
        .action(options => zipApp(options).catch(err => {
            console.error(err);
            process.exit(1);
        }));
};
