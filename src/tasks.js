const celery = require('../config/celery');

module.exports = {
    sendRegistrationEmail: (email, key) => {
        celery.callTask(['pytasks.tasks.registration_email', [email, key]]);
    }
};
