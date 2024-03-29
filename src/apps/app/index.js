/* eslint-disable class-methods-use-this */
const os = require('os');
const path = require('path');

const core = require('../../core');
const { version } = require('../../../package.json');

const BaseCtrl = core.ctrl;
const BaseFileCtrl = core.fileCtrl;
const ApiResponse = core.response;
const { getExecData } = core.utils;
const { APIError } = core.error;

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
        const tempfile = path.resolve(os.tmpdir(), 'test.mp4');

        return new ApiResponse({
            data: {
                version,
                tempfile
            }
        });
    }
}

/**
 * Command execution.
 */
class CommandExecution extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Command execution',
            NAME: 'enc',
            URLPREFIX,
            METHOD: 'get'
        };
    }

    async action() {
        if (!this.hasQueryParam('cmd')) {
            throw new APIError('No cmd query parameter found');
        }

        if (!this.hasQueryParam('output')) {
            throw new APIError('No output query parameter found');
        }

        const cmd = this.getQueryParam('cmd');

        // Execute command, the actual command is given as query parameter
        const output = this.getQueryParam('output');
        await getExecData(`${cmd} ${output}`);

        // Success, return the output file as response
        return new ApiResponse({
            file: output.slice(1, -1) // Remove double quotes around the name
        });
    }
}

const CMDMAP = {
    ffprobe: 'ffprobe -show_streams $file'
};

/**
 * Parse uploaded file.
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
        const cmdData = await getExecData(this.getCommand());
        return new ApiResponse({ cmdData });
    }

    getCommand() {
        const cmd = this.hasQueryParam('cmd') ? this.getQueryParam('cmd') : 'ffprobe';
        if (!Object.prototype.hasOwnProperty.call(CMDMAP, cmd)) {
            return this.error(`Invalid command query: ${cmd}`);
        }

        return CMDMAP[cmd].replace('$file', `${this.files[0].filepath}`);
    }
}

/**
 * Download file.
 */
class MediaFileDownload extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Download media files',
            NAME: 'media-download/:media',
            URLPREFIX,
            METHOD: 'get'
        };
    }

    async action() {
        const media = this.getParam('media');
        const imgPath = `${__dirname}/../../../${media}`;
        return new ApiResponse({ file: imgPath });
    }
}

/**
 * Close server.
 */
class CloseServer extends BaseCtrl {
    static get CLASSINFO() {
        return {
            INFO: 'Close server',
            NAME: 'close',
            METHOD: 'post',
            URLPREFIX
        };
    }

    action() {
        if (process.pkg) {
            setTimeout(() => process.kill(process.pid, 'SIGINT'), 50);
        }

        return Promise.resolve();
    }
}

// Export controllers
module.exports = [
    {
        cls: AppMetaData
    },
    {
        cls: CommandExecution
    },
    {
        cls: MediaFileUpload
    },
    {
        cls: MediaFileDownload
    },
    {
        cls: CloseServer
    }
];
