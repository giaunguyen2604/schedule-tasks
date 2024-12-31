const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  submitTask: (task) => ipcRenderer.send('submit-task', task),
});
