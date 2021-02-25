/* eslint-disable no-unused-vars */
const {
    app, BrowserWindow, ipcMain, dialog, nativeImage, remote
} = require('electron');

// https://github.com/sindresorhus/electron-is-dev/blob/main/index.js
function isElectronDev() {
    const app2 = app || remote.app;
    const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    return isEnvSet ? getFromEnv : !app2.isPackaged;
}

const isDev = isElectronDev();

// This will start the Node HTTP server
const server = require('./app');

let mainWindow;

async function createWindow() {
    // Wait until HTTP server is ready and port number is available
    const httpServer = await server.server();

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 1024,
        webPreferences: {
            nodeIntegration: false
        },
        icon: nativeImage.createFromPath(`${__dirname}/favicon.png`)
    });

    // Redirect to Node HTTP server
    mainWindow.loadURL(`http://localhost:${httpServer.address().port}`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    } else {
        // Devtools cannot be opened in production mode
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools();
        });
    }
}

app.on('ready', createWindow);

app.on('resize', (e, x, y) => {
    mainWindow.setSize(x, y);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('openModal', (event, name) => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    }).then(data => {
        if (!data.canceled) {
            mainWindow.webContents.send('open-file', {
                name,
                file: data.filePaths[0]
            });
        }
    });
});

ipcMain.on('saveModal', (event, name) => {
    dialog.showSaveDialog(mainWindow, {}).then(data => {
        if (!data.canceled) {
            mainWindow.webContents.send('save-file', {
                name,
                file: data.filePath
            });
        }
    });
});
