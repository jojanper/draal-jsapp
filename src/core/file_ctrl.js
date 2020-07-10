/* eslint-disable no-restricted-syntax */
const formidable = require('formidable');

const BaseCtrl = require('./base_ctrl');
const { APIError } = require('./error');
const { logger } = require('../logger');

/**
 * Controller for actions requiring file uploads.
 */
class BaseFileCtrl extends BaseCtrl {
    constructor(req, res, next) {
        super(req, res, next);
        this.files = null;
        this.fileFields = {};
    }

    /**
     * Handle files upload and then call parent controller action.
     */
    execute() {
        const form = new formidable.IncomingForm();

        form.parse(this.req, (err, fields, files) => {
            const filesKeys = Object.keys(files);

            if (err || filesKeys.length === 0) {
                logger.error(err);
                logger.error(`Number of files uploaded: ${filesKeys.length}`);
                this.next(new APIError('File upload failed'));
                return;
            }

            // Get the actual file, the file ID (key) is not of importance
            this.files = [];
            for (const key of Object.keys(files)) {
                this.files.push(files[key]);
            }

            this.fileFields = fields;

            super.execute();
        });

        return this;
    }
}

module.exports = BaseFileCtrl;
