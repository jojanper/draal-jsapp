const taskClient = require('../config/celery').client;

function executeTask() {
    taskClient.call('tasks.echo', ['Hello World!']);
}

module.exports = executeTask;
