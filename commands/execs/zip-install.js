const path = require('path');
const { promisify } = require('util');
const AdmZip = require('adm-zip');

const packageJson = require('../../package.json');

async function zipApp(cmdOptions) {
    const binary = `${cmdOptions.binary}_${packageJson.version}_${process.platform}.zip`;

    const zip = new AdmZip();
    zip.addLocalFolder(cmdOptions.folder);
    const promise = promisify(zip.writeZip);
    await promise(path.join(cmdOptions.folder, '..', binary));
}

module.exports = program => {
    program
        .command('zip-app')
        .description('Packetize application to zip format')
        .option('--folder <folder>', 'Source folder', 'builds/draaljsapp-linux-x64')
        .option('--binary <binary>', 'Target binary name', 'draaljsapp')
        .action(options => zipApp(options).catch(err => {
            console.error(err);
            process.exit(1);
        }));
};
