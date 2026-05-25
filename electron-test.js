/**
 * TEST ELECTRON ENTRY - Minimal version to debug
 * This file tests if Electron can launch at all
 */

const { app, BrowserWindow, screen } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let overlayWindow = null;

console.log('========================================');
console.log('ELECTRON TEST START');
console.log('isDev:', isDev);
console.log('Platform:', process.platform);
console.log('========================================');

function createWindow() {
  console.log('Creating window...');
  
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 500,
    height: 600,
    x: Math.round(screenWidth / 2 - 250),
    y: Math.round(screenHeight / 2 - 300),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron/preload/preload.js'),
      enableRemoteModule: false,
    },
    show: false,
  });

  console.log('Window created');

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'build/index.html')}`;

  console.log('Loading URL:', startUrl);
  
  overlayWindow.loadURL(startUrl);
  overlayWindow.show();
  console.log('Window shown');

  if (isDev) {
    overlayWindow.webContents.openDevTools();
  }

  overlayWindow.on('closed', () => {
    console.log('Window closed');
    overlayWindow = null;
  });

  overlayWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Content loaded successfully');
  });

  overlayWindow.webContents.on('crashed', () => {
    console.error('✗ Content crashed');
  });
}

app.on('ready', () => {
  console.log('App ready event');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('Activate event');
  if (overlayWindow === null) {
    createWindow();
  }
});

console.log('Electron test file loaded');
