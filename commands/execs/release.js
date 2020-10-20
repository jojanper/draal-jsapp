const { execute } = require('../utils');
const packageJson = require('../../package.json');

// Create new release
async function createRelease(cmdOptions) {
    const tag = `release-${cmdOptions.type}-${cmdOptions.version}`;
    const comment = `Release ${cmdOptions.type} ${cmdOptions.version}`;

    await execute(`git fetch origin && git checkout -f ${cmdOptions.branch}`);
    await execute(`git reset --hard origin/${cmdOptions.branch}`);
    await execute(`npm version --no-git-tag-version ${cmdOptions.version}`);
    await execute('git add package.json package-lock.json');
    await execute(`git commit -m "${comment}"`);
    await execute(`git tag -a ${tag} -m "${comment}"`);
    await execute(`git push origin ${cmdOptions.branch}`);
    await execute(`git push origin ${tag}`);
}

// Increate minor version field by one for the release version unless
// something else is explicitly specified
const [MAJOR, MINOR, PATCH] = packageJson.version.split('.');
const newMinor = parseInt(MINOR, 10) + 1;
const version = `${MAJOR}.${newMinor}.${PATCH}`;

module.exports = program => {
    program
        .command('create-release')
        .description('Create release')
        .option('--version <version>', 'Release version', version)
        .option('--branch <branch>', 'Release branch', 'master')
        .option('--type <type>', 'Release type', 'license')
        .action(options => createRelease(options).catch(err => {
            console.log(err);
            process.exit(1);
        }));
};
