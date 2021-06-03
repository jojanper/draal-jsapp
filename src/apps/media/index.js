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
        function param2Array(param) {
            const data = this.getQueryParam(param);
            return data ? data.split(',') : [];
        }

        const files = await getFileListing(this.getQueryParam('path'), {
            // Base path must be a directory
            basedir: this.hasQueryParam('basedir'),

            // Search recursively starting from base path
            recursive: this.hasQueryParam('recursive'),

            // Include only directories
            onlydir: this.hasQueryParam('onlydir'),

            // Include all directories
            withdir: this.hasQueryParam('withdir'),

            // Exclude dot directories
            nodot: this.hasQueryParam('nodotdir'),

            // Include files ending with pattern
            postfix: this.hasQueryParam('ext') ? param2Array.call(this, 'ext') : [],

            // Include files that start with pattern
            basename: this.hasQueryParam('base') ? param2Array.call(this, 'base') : []
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
