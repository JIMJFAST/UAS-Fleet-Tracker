const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Version
const APP_VERSION = '2.1.9';

console.log('================================');
console.log(`  UAS Fleet Tracker v${APP_VERSION}`);
console.log('================================');

// Data file path - saved in user's AppData folder
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'fleet-data.json');

let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#111827',
    title: 'UAS Fleet Tracker'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools with F12
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

// App ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================================
// DATA STORAGE HANDLERS (IPC)
// ============================================

// Load fleet data from JSON file
ipcMain.handle('load-fleet-data', async () => {
  try {
    // FIX: Use async file operations to prevent UI blocking
    await fs.promises.access(dataFilePath);
    const data = await fs.promises.readFile(dataFilePath, 'utf8');
    console.log('✓ Loaded fleet data from:', dataFilePath);
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing data file, will create on first save');
      return null;
    }
    console.error('Error loading fleet data:', error);
    return null;
  }
});

// Save fleet data to JSON file
ipcMain.handle('save-fleet-data', async (event, data) => {
  try {
    // FIX: Use async file operations to prevent UI blocking
    await fs.promises.mkdir(userDataPath, { recursive: true });

    // Write data with pretty formatting (async)
    await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✓ Saved fleet data to:', dataFilePath);
    return { success: true, path: dataFilePath };
  } catch (error) {
    console.error('Error saving fleet data:', error);
    return { success: false, error: error.message };
  }
});

// Get the data file path (for user reference)
ipcMain.handle('get-data-path', async () => {
  return dataFilePath;
});

// Export to custom location
ipcMain.handle('export-fleet-data', async (event, { data, format }) => {
  const { dialog } = require('electron');
  
  const filters = format === 'csv' 
    ? [{ name: 'CSV Files', extensions: ['csv'] }]
    : [{ name: 'JSON Files', extensions: ['json'] }];
  
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Fleet Data',
    defaultPath: `uas-fleet-export.${format}`,
    filters: filters
  });
  
  if (!result.canceled && result.filePath) {
    try {
      await fs.promises.writeFile(result.filePath, data, 'utf8');
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// Import from file
ipcMain.handle('import-fleet-data', async () => {
  const { dialog } = require('electron');
  
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Fleet Data',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const data = await fs.promises.readFile(result.filePaths[0], 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});
