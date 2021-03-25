const axios = require('axios');

const { execute } = require('../utils');
const packageJson = require('../../package.json');
const { promiseExecution } = require('../../src/core').utils;

const BUILD_PATH = `builds/${packageJson.name}-${process.platform}-x64/`;
const CYPRESS = 'node_modules/cypress/bin/cypress';

// Terminate background HTTP server
async function terminateServer(options) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    const url = `http://localhost:${options.port}/api/app/close`;

    console.log(`Terminate server: ${url}`);
    await promiseExecution(axios.post(url, null, config));
}

// Run Cypress E2E tests
async function testApp(options) {
    const cmd = [
        `DISABLE_BROWSER_OPEN=true PORT=${options.port}`,
        `${BUILD_PATH}${packageJson.name} && `,
        CYPRESS,
        options.cmd,
        `--browser ${options.browser}`,
        options.headless ? '--headless' : ''
    ].join(' ');
    console.log(cmd);

    await execute(cmd);

    if (options.terminate) {
        await terminateServer(options);
    }
}

module.exports = program => {
    program
        .command('e2e-test-app')
        .description('E2E application test')
        .option('--cmd <cmd>', 'Run command', 'run')
        .option('--browser <browser>', 'Browser', 'chrome')
        .option('--port <port>', 'Port', 3003)
        .option('--headless', 'Run headless', false)
        .option('--terminate', 'Terminate server after run', true)
        .action(options => testApp(options).catch(async code => {
            console.error(code);
            await terminateServer(options);
            process.exit(1);
        }));
};
