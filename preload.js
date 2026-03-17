const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Load fleet data from file
  loadFleetData: () => ipcRenderer.invoke('load-fleet-data'),
  
  // Save fleet data to file
  saveFleetData: (data) => ipcRenderer.invoke('save-fleet-data', data),
  
  // Get the data file path
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  
  // Export to custom location with file dialog
  exportFleetData: (data, format) => ipcRenderer.invoke('export-fleet-data', { data, format }),
  
  // Import from file with file dialog
  importFleetData: () => ipcRenderer.invoke('import-fleet-data'),
  
  // Check if running in Electron
  isElectron: true
});
