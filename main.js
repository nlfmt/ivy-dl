const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const fs = require("fs");

const downloadManager = require("./util/downloadManager");
const logger = require("./util/logger");


const isDev = !app.isPackaged;
const ansiEscRegEx = /\u001b\[\d+m/g;


// In production mode, write logs to file
if (!isDev) {
    // Create write stream to log file
    const fstream = fs.createWriteStream("ivy.log");
    const fsw = fstream.write.bind(fstream);
    

    // replace write functions and filter out ansi escape codes
    process.stdout.write = process.stderr.write = (...args) => {
        fsw(...args.map(a => {
            if (typeof a !== "string") return a;
            return a.replace(ansiEscRegEx, "");
        }));
    }
}

// TODO:
// - notifications
// - When the download finishes, show a notification and ask if the file should be converted (link to conversions)
// - create dialogs for download options and for viewing a downloaded video

winPreferences = {
    frame: false,
    background: "transparent",
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        worldSafeExecuteJavaScript: true,
        preload: path.join(__dirname, "preload.js")

    },
    width: 850,
    height: 700,
    hidden: true
}


app.on("ready", () => {
    logger.info("App ready");
    var mainWindow = new BrowserWindow(winPreferences);
    mainWindow.setMinimumSize(600,400)
    mainWindow.hide();
    
    mainWindow.loadURL(`file://${__dirname}/app/build/index.html`).then(() => {
        logger.info("App loaded");
        mainWindow.show();
        setInterval(() => {
            mainWindow.webContents.send("ping");
        }, 1000);
    });

    mainWindow.on("closed", () => app.quit());

    downloadManager.init(mainWindow, ipcMain);

    // TODO: improve, add title options etc
    ipcMain.on("notify", (_, message) => {
        new Notification({ title: "Notification!", body: message }).show();
    });

    ipcMain.on("shell:showfile", (e, path) => {
        let exp = spawn("explorer.exe", ["/select,", path]);
        exp.stdout.on("data", (d) => console.log(d));
        exp.stderr.on("data", (d) => console.log(d));
    });

    ipcMain.on("fs:delete", (e, path) => {
        fs.unlink(path, () => {});
    });

    // Window Events
    ipcMain.on("window:close", () => app.quit());

    ipcMain.on("window:minimize", () => mainWindow.minimize());

    ipcMain.on("window:maximize", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
});

if (isDev) {
    require("electron-reload")(__dirname, {
        electron: path.join(__dirname, "node_modules", ".bin", "electron")
    });
}