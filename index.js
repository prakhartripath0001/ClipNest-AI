/**
 * ELECTRON APP ENTRY POINT
 * ========================
 * 
 * This file is specified in package.json as the main entry point.
 * It tells Electron where to find the main process file.
 * 
 * In development, this starts the Electron app.
 * In production, it loads the built main process.
 */

module.exports = require('./dist/electron/main/index.js');
