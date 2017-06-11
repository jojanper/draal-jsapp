const celery = require('../config/celery');

function executeTask() {
    celery.callTask(['pytasks.tasks.echo', ['Hello World!']]);
}

module.exports = {
    executeTask
};
