const { promisify } = require('util');
const glob = require('glob');

const { execute } = require('../utils');

// Minify sources
async function minify(cmdOptions) {
    const globPromise = promisify(glob);
    const files = await globPromise(`${cmdOptions.folder}/**/*.js`);

    files.push('app.js');
    files.push('main.js');

    if (cmdOptions.revert) {
        const cmd = `git checkout -- ${files.join(' ')}`;
        await execute(cmd);
    } else {
        const promises = [];
        for (let i = 0; i < files.length; i++) {
            const cmd = `npm run minify -- --output ${files[i]} -- ${files[i]}`;
            promises.push(execute(cmd));
        }

        await Promise.all(promises);
    }
}

module.exports = program => {
    program
        .command('minify-sources')
        .description('Minify JS source files')
        .option('--folder <version>', 'Parent source folder', 'src')
        .option('--revert', 'Revert minification', false)
        .action(options => minify(options).catch(err => {
            console.log(err);
            process.exit(1);
        }));
};
