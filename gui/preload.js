const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  runScript: (data) => ipcRenderer.invoke('run-script', data),
});
