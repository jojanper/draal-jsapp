/* eslint-disable class-methods-use-this */
const core = require('../../core');

const { version } = require('../../../package.json');

const BaseCtrl = core.ctrl;
const BaseFileCtrl = core.fileCtrl;
const ApiResponse = core.response;
const { getExecData } = core.utils;

// API URL prefix
const URLPREFIX = 'app';

/**
 * Application meta data
 */
class AppMetaData extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Application metadata',
            NAME: 'metadata',
            URLPREFIX,
            METHOD: 'get'
        };
    }

    async action() {
        return new ApiResponse({
            data: {
                version
            }
        });
    }
}

/**
 * Parse uploaded license file.
 */
class MediaFileUpload extends BaseFileCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Query uploaded media file properties',
            URL: 'media-upload',
            NAME: 'media-upload',
            URLPREFIX,
            METHOD: 'post'
        };
    }

    async action() {
        const cmd = [`ffprobe -show_streams ${this.files[0].path}`].join(' && ');
        const cmdData = await getExecData(cmd);
        return new ApiResponse({ cmdData });
    }
}

// Export controllers
module.exports = [
    {
        cls: AppMetaData
    },
    {
        cls: MediaFileUpload
    }
];
