module.exports = {
    spec: ['src/**/*.spec.js', 'tests/bootstrap.spec.js'],
    reporter: 'spec',
    recursive: true,
    require: ['tests/helpers'],
    timeout: 3000,
    ui: 'bdd',
    exit: true
};
