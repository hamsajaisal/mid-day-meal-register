const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveData: (dataString) => ipcRenderer.invoke('save-file-dialog', dataString),
    loadData: () => ipcRenderer.invoke('open-file-dialog'),
    exportPDF: () => ipcRenderer.invoke('print-to-pdf'),
    print: () => window.print()
});
