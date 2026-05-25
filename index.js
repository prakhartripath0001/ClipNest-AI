/**
 * ELECTRON APP ENTRY POINT
 * ========================
 * 
 * This file is specified in package.json as the main entry point.
 * It tells Electron where to find the main process file.
 * 
 * In development, this starts the Electron app from source.
 * In production, it loads the built main process.
 */

const isDev = require('electron-is-dev');
const path = require('path');

if (isDev) {
  // Development: load from source
  module.exports = require('./electron/main/index.js');
} else {
  // Production: load from built dist folder
  module.exports = require('./dist/electron/main/index.js');
}
