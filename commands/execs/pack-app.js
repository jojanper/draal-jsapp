const { execute } = require('../utils');

const packageJson = require('../../package.json');

const BIN = 'node_modules/electron-packager/bin/electron-packager.js';

// Package Electron application
async function packApp(cmdOptions) {
    const ignore = [
        '.coverage',
        '.env.secrets',
        '.env-docker',
        '.env.docker-aws',
        '.eslintignore',
        '.flake8',
        '.gitignore',
        '.nyc_output',
        '.vscode',
        'package-lock.json',
        '^/nodemon.json',
        '^/pm2.config.js$',
        '^/TODO',
        '^/.*.yml$',
        '^/.*.md$',
        '^/.*.tar$',
        '^/.*.txt$',
        '^/.*.spec.js$',
        '^/angular-app',
        '^/commands',
        '^/config/app',
        '^/config/aws',
        '^/config/celery/Dockerfile',
        '^/config/electron/debian.json',
        '^/config/nginx',
        '^/config/rabbitmq',
        '^/coverage',
        '^/development-logs',
        '^/docs',
        '^/docker-logs',
        '^/logs',
        '^/pytasks',
        '^/test',
        '^/virtualenv*'
    ].map(item => `--ignore=${item}`).join(' ');

    const options = [
        '--asar',
        '--overwrite',
        '--prune=true',
    ];

    if (cmdOptions.platform === 'osx') {
        options.push('--icon=./config/electron/favicon.icns');
    } else if (cmdOptions.platform === 'win') {
        /* eslint-disable no-useless-escape */
        options.push('--icon=./config/electron/favicon.ico');
        options.push('--win32metadata.CompanyName=\"\"');
        options.push('--win32metadata.FileDescription=\"\"');
        options.push(`--win32metadata.ProductName=\"${packageJson.productName}\"`);
        /* eslint-enable no-useless-escape */
    }

    const prefix = process.platform !== 'win32' ? 'DEBUG=electron-packager' : '';
    const cmd = `${prefix} node ${BIN} . draaljsapp ${options.join(' ')} ${ignore} --out=./builds`;
    console.log(cmd);
    await execute(cmd);
}

module.exports = program => {
    program
        .command('pack-app')
        .description('Package application')
        .option('--platform <platform>', 'Target platform', 'linux')
        .action(options => packApp(options).catch(code => {
            console.error(code);
            process.exit(1);
        }));
};
