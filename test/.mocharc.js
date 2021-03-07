module.exports = {
    spec: ['src/**/*.spec.js', 'test/bootstrap.spec.js'],
    reporter: 'spec',
    recursive: true,
    require: ['test/helpers'],
    timeout: 3000,
    ui: 'bdd',
    exit: true
};
