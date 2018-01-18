describe('Socket server', () => {
    it('supports chat messages', () => {
        const message = 'Hello World';
        return socketClient('message', message)
            .then((response) => {
                const [data, closeFn] = response;

                expect(data).to.be.equal(message);
                closeFn();
            })
            .catch((err) => { throw new Error(err); });
    });
});
