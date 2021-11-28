const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    notificationApi: {
        sendNotification(message) {
            ipcRenderer.send("notify", message);
        }
    },
    window: {
        close() {
            ipcRenderer.send("window:close");
        },
        minimize() {
            ipcRenderer.send("window:minimize");
        },
        maximize() {
            ipcRenderer.send("window:maximize");
        }
    }
});