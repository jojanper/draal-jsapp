/* eslint-disable class-methods-use-this */
const core = require('../../core');

const BaseCtrl = core.ctrl;
const ApiResponse = core.response;
const ValidatorAPI = core.validators;
const { promiseExecution, Wave, getFileListing } = core.utils;

// API URL prefix
const URLPREFIX = 'media';

/**
 * WAVE file details
 */
class WaveAudio extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Wave audio info',
            NAME: 'wave',
            URLPREFIX
        };
    }

    static get VALIDATORS() {
        return [
            {
                field: 'filename',
                api: ValidatorAPI.API.body,
                validators: [ValidatorAPI.VALIDATORS.exists]
            }
        ];
    }

    async getWaveInfo(wavfileName) {
        const info = {};
        const [err, header] = await promiseExecution(Wave.WaveParser(wavfileName));
        if (err === null) {
            info.duration = header.duration;
        }

        return info;
    }

    async action() {
        const info = await this.getWaveInfo(decodeURIComponent(this.getPostParam('filename')));
        return new ApiResponse({ data: info });
    }
}

/**
 * File system listing based on path prefix.
 */
class FileListing extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'File listing',
            NAME: 'file-listing',
            URLPREFIX,
            METHOD: 'get'
        };
    }

    async action() {
        const files = await getFileListing(this.getQueryParam('path'), {
            basedir: this.hasQueryParam('basedir'),
            recursive: this.hasQueryParam('recursive'),
            postfix: this.hasQueryParam('ext') ? this.getQueryParam('ext').split(',') : [],
            basename: this.hasQueryParam('base') ? this.getQueryParam('base').split(',') : []
        });

        return new ApiResponse({ data: files });
    }
}

// Export controllers
module.exports = [
    {
        cls: WaveAudio
    },
    {
        cls: FileListing
    }
];