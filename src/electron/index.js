const { app, remote } = require('electron');
const Store = require('electron-store');

const isMac = process.platform === 'darwin';

function getMenuTemplate(devTools = true) {
    return [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [{ role: 'pasteAndMatchStyle' }] : []),
                { type: 'separator' },
                { role: 'selectAll' }
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                ...devTools ? [{ role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }] : [],
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [{ role: 'close' }])
            ]
        }
    ];
}

/**
 * App preferences + settings storage.
 */
class AppStore {
    constructor(packageJson) {
        this.store = new Store({
            name: packageJson.name,
            defaults: {
                // 1280x1024 is the default size of our window
                windowBounds: { width: 1280, height: 1024 },
                version: packageJson.version,
            }
        });

        // Check if app has been updated since last start
        this._verMismatch = false;
        if (this.store.get('version') !== packageJson.version) {
            this._verMismatch = true;
            this.store.set('version', packageJson.version);
        }
    }

    // Should app cache be flushed?
    get flushCache() {
        return this._verMismatch;
    }

    // Get window width and height
    getWindowBounds() {
        return this.store.get('windowBounds');
    }

    // Store window width and height
    setWindowBounds(width, height) {
        // Avoid ridiculously small values
        if (width > 20 && height > 20) {
            this.store.set('windowBounds', { width, height });
        }
    }
}

// https://github.com/sindresorhus/electron-is-dev/blob/main/index.js
function isElectronDev() {
    const app2 = app || remote.app;
    const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    return isEnvSet ? getFromEnv : !app2.isPackaged;
}

module.exports = {
    isElectronDev,
    AppStore,
    getMenuTemplate
};
