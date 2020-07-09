module.exports = {
    apps: [
        {
            name: 'draaljsapp',
            script: './app.js',
            watch: true,
            time: true,
            env: {
                PORT: 4000,
                NODE_ENV: 'development'
            },
            env_production: {
                PORT: 4000,
                NODE_ENV: 'production'
            }
        },
        {
            name: 'draaljsapp-dev',
            script: './app.js',
            watch: true,
            time: true,
            env_production: {
                PORT: 4004,
                NODE_ENV: 'production',
                SECRETS_PATH: '.env.local'
            }
        }
    ]
};
