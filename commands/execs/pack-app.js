const { execute } = require('../utils');

const packageJson = require('../../package.json');

const BIN = 'node_modules/electron-packager/bin/electron-packager.js';

const BUILD_PATH = `builds/${packageJson.name}-${process.platform}-x64/`;

// Package application as pkg
async function packPkgApp(cmdOptions) {
    const targets = {
        linux: 'node12-linux-x64'
    };

    const cmd = [
        'npm run pkg --',
        '--targets',
        targets[cmdOptions.platform],
        `--out-path=./${BUILD_PATH}`,
        '.'
    ].join(' ');

    console.log(cmd);
    await execute(cmd);
}

// Package application as Electron
async function packElectronApp(cmdOptions) {
    const ignore = [
        '.coverage',
        '.env.secrets',
        '.env-docker',
        '.env.pkg',
        '.env.docker-aws',
        '.eslintignore',
        '.flake8',
        '^/.gitignore',
        '.nyc_output',
        '.vscode',
        'app-pkg.js',
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
        options.push(`--win32metadata.FileDescription=\"${packageJson.productName}\"`);
        options.push(`--win32metadata.ProductName=\"${packageJson.productName}\"`);
        /* eslint-enable no-useless-escape */
    }

    const prefix = process.platform !== 'win32' ? 'DEBUG=electron-packager' : '';
    const cmd = `${prefix} node ${BIN} . ${packageJson.name} ${options.join(' ')} ${ignore} --out=./builds`;
    console.log(cmd);
    await execute(cmd);

    // Create debian package for Linux platform
    if (process.platform === 'linux') {
        await execute([
            'npm run debian-install --',
            `--src ${BUILD_PATH}`,
            '--arch amd64',
            '--config config/electron/debian.json'
        ].join(' '));
    }
}

// Package creation
async function packApp(options) {
    if (options.type === 'electron') {
        await packElectronApp(options);
    } else if (options.type === 'pkg') {
        await packPkgApp(options);
    } else {
        throw new Error('No packetization type specified');
    }
}

module.exports = program => {
    program
        .command('pack-app')
        .description('Package application')
        .option('--platform <platform>', 'Target platform', 'linux')
        .option('--type <type>', 'Packetization type', packageJson.package.type)
        .action(options => packApp(options).catch(code => {
            console.error(code);
            process.exit(1);
        }));
};
