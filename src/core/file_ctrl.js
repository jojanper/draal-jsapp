/* eslint-disable no-restricted-syntax */
const util = require('util');
const fs = require('fs');

const BaseCtrl = require('./base_ctrl');
const { APIError } = require('./error');
const { logger } = require('../logger');

let formidable;

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
    async execute() {
        if (!formidable) {
            formidable = await import('formidable');
        }

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
                this.files.push(files[key][0]);
            }

            // Map the associated data if any
            for (const key of Object.keys(fields)) {
                try {
                    this.fileFields[key] = JSON.parse(fields[key]);
                } catch (e) {
                    this.fileFields[key] = fields[key];
                }
            }

            super.execute();
        });

        return this;
    }

    async destroy() {
        if (this.files) {
            const unlink = util.promisify(fs.unlink);
            const promises = this.files.map(item => unlink(item.filepath));
            Promise.all(promises).catch(() => { });
        }
    }
}

module.exports = BaseFileCtrl;
