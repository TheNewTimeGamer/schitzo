const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("data", {
    getFiles: async (path) => { return await ipcRenderer.invoke('list-files', path); }
});
contextBridge.exposeInMainWorld("api", {
    minimize: () => { ipcRenderer.invoke('window-minimize'); },
    maximize: () => { ipcRenderer.invoke('window-maximize'); },
    close: () => { ipcRenderer.invoke('window-close'); },
    startDrag: (event) => { ipcRenderer.invoke('window-start-drag', event); },
    endDrag: (event) => { ipcRenderer.invoke('window-end-drag', event); }
})
