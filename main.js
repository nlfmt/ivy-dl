const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;


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
    var mainWindow = new BrowserWindow(winPreferences);
    mainWindow.setMinimumSize(600,400)
    mainWindow.hide();

    mainWindow.loadURL(`file://${__dirname}/app/build/index.html`).then(() => {
        console.log("Ready!");
        mainWindow.show();
    });

    mainWindow.on("closed", () => app.quit());

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