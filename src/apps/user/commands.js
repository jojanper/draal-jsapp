/**
 * Management commands for user module.
 */
const program = require('commander');
const mongoose = require('mongoose');
const prettyjson = require('prettyjson');

const draaljsConfig = require('../../../config');
const {User, AccountProfile } = require('./models');

const options = {
    noColor: false
};

// Serialize and pretty print MongoDB documents
const serialize = (items) => {
    items.forEach((item) => {
        console.log(prettyjson.render(item.toObject(), options));
        console.log();
    });

    process.exit(0);
};

// Execute query and serialize it
const execute = (fn) => {
    draaljsConfig.mongo.config(mongoose, () => {
        fn().then(serialize);
    });
};


program.command('getUsers').description('List users').action(() => {
    execute(() => User.manager.execute('find'));
});


program.command('getAccountProfiles').description('List account profiles').action(() => {
    execute(() => {
        const dbObj = AccountProfile.manager.queryObj('find', {});
        const query = dbObj.getQuery().populate('user');
        return dbObj.setQuery(query).exec();
    });
});

program.parse(process.argv);
