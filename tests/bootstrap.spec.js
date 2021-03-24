// To be executed once before all tests
before(done => {
    const { credentials } = appTestHelper;

    // Create one active test user
    appTestHelper.createUser(credentials, () => {
        appTestHelper.activateUser(credentials.email, () => done());
    });
});

// To be executed once all tests have finished
after(() => {
});
