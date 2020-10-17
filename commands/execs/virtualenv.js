const shelljs = require('shelljs');
const { format } = require('util');

async function prepareVirtualenv(options) {
    const commands = [
        format('mkdir -p %s', options.folder),
        format('cd %s', options.folder),
        format('virtualenv -p %s --system-site-packages %s', options.python, options.project),
        'cd ..',
        format('. ./%s/%s/bin/activate', options.folder, options.project),
        'npm run pip-install'
    ];

    shelljs.exec(commands.join(' && '), code => {
        shelljs.exit(code);
    });
}

module.exports = program => {
    program
        .command('virtualenv')
        .description('Prepare virtualenv')
        .option('--python <python>', 'Python path', '/usr/bin/python3')
        .option('--folder <folder>', 'Virtual folder name', 'virtualenv')
        .option('--project <project>', 'Project name under virtualenv folder', 'draal')
        .action(options => prepareVirtualenv(options).catch(code => {
            console.error(code);
            process.exit(1);
        }));
};
