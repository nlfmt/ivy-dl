const { ipcRenderer: ipc, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    notificationApi: {
        sendNotification(message) {
            ipc.send("notify", message);
        }
    },
    window: {
        close() {
            ipc.send("window:close");
        },
        minimize() {
            ipc.send("window:minimize");
        },
        maximize() {
            ipc.send("window:maximize");
        }
    },
    dlMgr: {
        new: (url, opts) => ipc.send("download:new", url, opts),
        pause: url => ipc.send("download:pause", url),
        resume: url => ipc.send("download:resume", url),
        stop: url => ipc.send("download:stop", url),

        loadDownloads() {
            ipc.send("downloads:load");

            return new Promise((resolve, reject) => {
                ipc.once("downloads:load", (_, dls) => {
                    resolve(dls);
                });
            });
        },
        onNewDownload(callback) {
            ipc.on("download:new", (_, dl) => {
                console.log("new download", dl);
                callback(dl);
            });
        },
        offNewDownload(callback) {
            ipc.removeListener("download:new", callback);
        },

        onInfo(url, callback) {
            ipc.on(`info:${url}`, (_, dl) => {
                callback(dl);
            })
        },

        onStatusChange(url, callback) {
            ipc.on(`status:${url}`, (_, s) => {
                callback(s);
            })
        },
        offStatusChange(url, callback) {
            ipc.removeListener(`status:${url}`, callback);
        },
        onProgress(url, callback) {
            ipc.on(`progress:${url}`, (_, p) => {
                callback(p);
            });
        },
        offProgress(url, callback) {
            ipc.removeListener(`progress:${url}`, callback);
        }
    }
});