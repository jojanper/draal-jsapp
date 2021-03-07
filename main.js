const {
    app, BrowserWindow, ipcMain, dialog, nativeImage, Menu
} = require('electron');

const packageJson = require('./package.json');
const { isElectronDev, getMenuTemplate, AppStore } = require('./src/electron');

const isDev = isElectronDev();
const store = new AppStore(packageJson);

// This will start the Node HTTP server
const server = require('./app');

Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate()));

let mainWindow;

async function createWindow() {
    let { width, height } = store.getWindowBounds();

    // Wait until HTTP server is ready and port number is available
    const httpServer = await server.server();

    mainWindow = new BrowserWindow({
        width,
        height,
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

    mainWindow.on('resize', () => {
        ({ width, height } = mainWindow.getBounds());
        store.setWindowBounds(width, height);
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

ipcMain.on('open-modal', (event, name) => {
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

ipcMain.on('save-modal', (event, name) => {
    dialog.showSaveDialog(mainWindow, {}).then(data => {
        if (!data.canceled) {
            mainWindow.webContents.send('save-file', {
                name,
                file: data.filePath
            });
        }
    });
});
