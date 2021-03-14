const fs = require('fs');
const util = require('util');
const path = require('path');
const { fdir: Fdir } = require('fdir');

const { asyncFilter } = require('./utils');
const { promiseExecution } = require('./exec');

/**
 * Check if specified file path is directory.
 *
 * @param {*} file File path.
 * @returns Promise that resolves to directory status.
 */
async function isDirectory(file) {
    const promise = util.promisify(fs.stat);
    const [err, stat] = await promiseExecution(promise(file));
    return !err && stat.isDirectory();
}

/**
 * Check if specified file exists.
 *
 * @param {*} filePath Name of file.
 * @returns Promise that resolves to true if file exists and false if file does not exist.
 */
async function fileExists(filePath) {
    const promise = util.promisify(fs.access)(filePath, fs.constants.F_OK);
    const response = await promiseExecution(promise);
    return !response[0];
}

/**
 * Filter specified files (string) array using given filtering conditions.
 */
async function getFilteredFiles(files, pathPrefix, {
    extensions, basename, onlydir, nodotdir
}) {
    // Is base path actually a directory
    let isDir = await isDirectory(pathPrefix);

    // If directory, then what is the file path separator used by the platform
    const subPrefix = isDir && !pathPrefix.endsWith(path.sep) ? path.sep : '';

    // Filter files
    const data = await asyncFilter(files, async file => {
        // Exclude dot files and directories
        if (nodotdir) {
            if (file.startsWith('.')) {
                return false;
            }
        }

        // Include only directories
        if (onlydir) {
            isDir = await isDirectory(`${pathPrefix}${subPrefix}${file}`);
            return isDir;
        }

        // Include if file ends with one of the specified patterns
        const isExt = extensions.some(item => file.endsWith(item));
        if (isExt) {
            return true;
        }

        // Include if file basename starts with specified pattern
        if (basename.length) {
            const filename = path.basename(file);
            const isBase = basename.some(item => filename.startsWith(item));
            if (isBase) {
                return true;
            }
        }

        // Include directories
        isDir = await isDirectory(`${pathPrefix}${subPrefix}${file}`);
        if (isDir) {
            return true;
        }

        return !extensions.length;
    });

    // Add the base path to each file
    return data.map(file => `${pathPrefix}${subPrefix}${file}`);
}

/**
 * Get files listing from specified base path, subdir content is not included.
 */
async function getNonRecursiveFileListing(pathPrefix, options) {
    let prefix = pathPrefix;
    const promise = util.promisify(fs.readdir);
    let [err, files] = await promiseExecution(promise(pathPrefix));

    if (err !== null) {
        const pathPrefixUpper = path.dirname(pathPrefix);

        [err, files] = await promiseExecution(promise(pathPrefixUpper));
        if (err === null) {
            prefix = `${pathPrefixUpper}${path.sep}`;
            files = files.filter(file => file.startsWith(pathPrefix));
        }
    }

    return (err === null) ? getFilteredFiles(files, prefix, options) : [];
}

/**
 * Get files listing from specified base path, subdir content is included.
 */
async function getRecursiveFileListing(pathPrefix, { extensions, basename, basedir }) {
    // Make sure path is valid
    const exists = await fileExists(pathPrefix);
    if (!exists) {
        return [];
    }

    // Base path must be a directory
    if (basedir) {
        const isDir = await isDirectory(pathPrefix);
        if (!isDir) {
            return [];
        }
    }

    let api = new Fdir();

    if (extensions.length || basename.length) {
        api = api.filter(file => {
            // Include if file ends with one of the specified patterns
            const isExt = extensions.some(item => file.endsWith(item));
            if (isExt) {
                return true;
            }

            // Include if file basename starts with specified pattern
            if (basename.length) {
                const filename = path.basename(file);
                const isBase = basename.some(item => filename.startsWith(item));
                if (isBase) {
                    return true;
                }
            }

            return false;
        });
    }

    api = api.withFullPaths().crawl(pathPrefix);
    const [err, data] = await promiseExecution(api.withPromise());
    return (err === null) ? data : [];
}

/**
 * Get file listing from base path using given filtering conditions.
 *
 * @param {*} files Files array
 * @param {*} pathPrefix Base path of the files.
 * @param {*} options.postfix File ending pattern.
 * @param {*} options.basename File starting pattern.
 * @param {*} options.basedir Base path must be path to a directory.
 * @param {*} options.onlydir Include only directories in the results.
 * @returns Promise that resolves to filtered files array.
 */
async function getFileListing(pathPrefix, options) {
    const extensions = options ? options.postfix || [] : [];
    const basename = options ? options.basename || [] : [];
    const params = { ...options, extensions, basename };

    // Full file content is requested
    if (options && options.recursive) {
        return getRecursiveFileListing(pathPrefix, params);
    }

    // Only first level listing required
    return getNonRecursiveFileListing(pathPrefix, params);
}

/**
 * Read specified file as JSON.
 *
 * @param {*} filepath Name of JSON file.
 * @returns JSON data, null on failure.
 */
async function readJson(filepath) {
    const readFn = util.promisify(fs.readFile);
    const [err, data] = await promiseExecution(readFn(filepath));

    if (err) {
        return null;
    }

    return JSON.parse(data.toString('utf-8'));
}

module.exports = {
    isDirectory,
    fileExists,
    getFileListing,
    readJson
};
