module.exports = {
    spec: ['src/**/*.spec.js', 'test/bootstrap.spec.js'],
    // 'watch-files': ['src/**/*.spec.js', 'test/bootstrap.spec.js'],
    // extension: ["js"],
    reporter: 'spec',
    recursive: true,
    require: ['test/helpers'],
    // file: ['test/helpers'],
    // u: 'exports',
    timeout: 3000,
    ui: 'bdd',
    exit: true
};
