const celery = require('../config/celery');

function executeTask() {
    celery.callTask(['tasks.echo', ['Hello World!']]);
}

module.exports = {
    executeTask
};
