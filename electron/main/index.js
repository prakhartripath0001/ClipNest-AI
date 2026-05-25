/**
 * ELECTRON MAIN PROCESS
 * =====================
 * 
 * This is the main Electron process that runs on application startup.
 * It manages:
 * - Application lifecycle
 * - Window creation and management
 * - IPC communication with renderer (React)
 * - System-level integrations (clipboard, shortcuts, etc.)
 * - Database initialization
 * 
 * Architecture:
 * 1. Main Process (this file) - system integration
 * 2. Renderer Process (React) - UI
 * 3. Database Layer - data persistence
 * 4. Services - clipboard, screenshot, OCR
 * 
 * IPC Flow:
 * React Component -> (invoke) -> IPC Handler -> Service/Database -> IPC Response -> React
 */

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu,
  Tray,
  screen,
} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const db = require('../../src/database/db');
const {
  addClipboardItem,
  getClipboardItems,
  getClipboardItemById,
  deleteClipboardItem,
  updateClipboardItem,
  searchClipboardItems,
  getClipboardItemsByType,
  toggleFavorite,
  getFavoriteItems,
  clearClipboardHistory,
} = require('../../src/database/operations');
const clipboardService = require('../services/clipboardService');
const screenshotService = require('../services/screenshotService');

// Keep a global reference to prevent garbage collection
let mainWindow = null;
let overlayWindow = null;
let tray = null;

// ============ WINDOW CREATION ============

/**
 * Create the main overlay window
 * 
 * Features:
 * - Frameless, transparent window
 * - Always on top
 * - Global keyboard shortcut toggle
 * - Dark mode support
 * - Hardware acceleration enabled
 */
function createOverlayWindow() {
  // Get the primary display
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 500,
    height: 600,
    x: Math.round(screenWidth / 2 - 250), // Center horizontally
    y: Math.round(screenHeight / 2 - 300), // Center vertically
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      enableRemoteModule: false,
    },
    frame: false, // Frameless window
    transparent: true, // Transparent background for custom styling
    alwaysOnTop: true, // Always show on top of other windows
    skipTaskbar: false, // Show in taskbar for visibility
    show: false, // Don't show until ready
    resizable: true,
    movable: true,
  });

  // Load the React app
  const startUrl = isDev
    ? 'http://localhost:3000' // Development: local React dev server
    : `file://${path.join(__dirname, '../build/index.html')}`; // Production: built React app

  overlayWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Log window events for debugging
  overlayWindow.webContents.on('did-finish-load', () => {
    console.log('Overlay window content loaded successfully');
  });

  overlayWindow.webContents.on('crashed', () => {
    console.error('Overlay window crashed');
  });

  // Handle window closed
  overlayWindow.on('closed', () => {
    console.log('Overlay window closed');
    overlayWindow = null;
  });

  // Don't hide on blur - user controls visibility
  // Removed the blur event listener

  return overlayWindow;
}

/**
 * Toggle overlay window visibility
 * 
 * Shows window if hidden, hides if visible
 */
function toggleOverlay() {
  if (!overlayWindow) {
    createOverlayWindow();
  }

  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    overlayWindow.show();
    overlayWindow.focus();
  }
}

// ============ APP LIFECYCLE ============

/**
 * App ready event
 * 
 * Called when Electron has finished initialization.
 * This is where we set up everything.
 */
app.on('ready', async () => {
  try {
    // Initialize database
    console.log('Initializing database...');
    await db.init();

    // Create overlay window
    createOverlayWindow();

    // Start monitoring services
    console.log('Starting background services...');
    clipboardService.startMonitoring();
    screenshotService.startMonitoring();

    // Register global shortcut (Cmd+Shift+Space on Mac, Ctrl+Shift+Space on Windows/Linux)
    const shortcut = process.platform === 'darwin' ? 'Cmd+Shift+Space' : 'Ctrl+Shift+Space';
    const registered = globalShortcut.register(shortcut, () => {
      console.log('Global shortcut triggered:', shortcut);
      toggleOverlay();
    });

    if (!registered) {
      console.warn('Failed to register global shortcut');
    } else {
      console.log('Global shortcut registered:', shortcut);
    }

    // Create system tray menu
    createTrayMenu();

    console.log('Application ready');
  } catch (error) {
    console.error('Error during app initialization:', error);
    app.quit();
  }
});

/**
 * Window all closed event
 * 
 * On macOS, applications stay active until user quits explicitly
 * On Windows/Linux, quit when all windows are closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate event (macOS only)
 * 
 * Called when user clicks app icon in dock (macOS)
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createOverlayWindow();
  }
});

/**
 * Before quit event
 * 
 * Clean up resources before application exits
 */
app.on('before-quit', async () => {
  console.log('Cleaning up...');

  // Unregister global shortcuts
  globalShortcut.unregisterAll();

  // Stop monitoring services
  clipboardService.stopMonitoring();
  screenshotService.stopMonitoring();

  // Close database
  await db.close();

  console.log('Cleanup complete');
});

// ============ IPC HANDLERS (CLIPBOARD) ============

/**
 * Get clipboard items
 * 
 * IPC Handler: 'clipboard:getItems'
 */
ipcMain.handle('clipboard:getItems', async (event, { limit = 20, offset = 0 }) => {
  try {
    return await getClipboardItems(limit, offset);
  } catch (error) {
    console.error('Error getting clipboard items:', error);
    throw error;
  }
});

/**
 * Get single clipboard item
 * 
 * IPC Handler: 'clipboard:getItem'
 */
ipcMain.handle('clipboard:getItem', async (event, { id }) => {
  try {
    return await getClipboardItemById(id);
  } catch (error) {
    console.error('Error getting clipboard item:', error);
    throw error;
  }
});

/**
 * Copy clipboard item back to system clipboard
 * 
 * IPC Handler: 'clipboard:copy'
 */
ipcMain.handle('clipboard:copy', async (event, { id }) => {
  try {
    const item = await getClipboardItemById(id);
    if (!item) throw new Error('Item not found');

    // Copy based on type
    if (item.type === 'image' && item.file_path) {
      await clipboardService.copyImageToClipboard(item.file_path);
    } else {
      clipboardService.copyToClipboard(item.content);
    }

    // Update access count and time
    await updateClipboardItem(id, {
      access_count: (item.access_count || 0) + 1,
      accessed_at: new Date().toISOString(),
    });

    console.log('Item copied to clipboard:', id);
  } catch (error) {
    console.error('Error copying item:', error);
    throw error;
  }
});

/**
 * Delete clipboard item
 * 
 * IPC Handler: 'clipboard:delete'
 */
ipcMain.handle('clipboard:delete', async (event, { id }) => {
  try {
    await deleteClipboardItem(id);
    console.log('Item deleted:', id);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
});

/**
 * Search clipboard items
 * 
 * IPC Handler: 'clipboard:search'
 */
ipcMain.handle('clipboard:search', async (event, { query, type }) => {
  try {
    return await searchClipboardItems(query, type, 20);
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
});

/**
 * Get items by type
 * 
 * IPC Handler: 'clipboard:getByType'
 */
ipcMain.handle('clipboard:getByType', async (event, { type, limit = 20 }) => {
  try {
    return await getClipboardItemsByType(type, limit);
  } catch (error) {
    console.error('Error getting items by type:', error);
    throw error;
  }
});

/**
 * Toggle favorite status
 * 
 * IPC Handler: 'clipboard:toggleFavorite'
 */
ipcMain.handle('clipboard:toggleFavorite', async (event, { id }) => {
  try {
    return await toggleFavorite(id);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
});

/**
 * Get favorite items
 * 
 * IPC Handler: 'clipboard:getFavorites'
 */
ipcMain.handle('clipboard:getFavorites', async (event) => {
  try {
    return await getFavoriteItems(20);
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
});

/**
 * Clear clipboard history
 * 
 * IPC Handler: 'clipboard:clearHistory'
 */
ipcMain.handle('clipboard:clearHistory', async (event) => {
  try {
    await clearClipboardHistory();
    console.log('Clipboard history cleared');
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
});

// ============ IPC HANDLERS (WINDOW) ============

/**
 * Close overlay window
 * 
 * IPC Handler: 'window:close' (sent, not invoked)
 */
ipcMain.on('window:close', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

/**
 * Minimize window
 * 
 * IPC Handler: 'window:minimize'
 */
ipcMain.on('window:minimize', () => {
  if (overlayWindow) {
    overlayWindow.minimize();
  }
});

/**
 * Focus window
 * 
 * IPC Handler: 'window:focus'
 */
ipcMain.on('window:focus', () => {
  if (overlayWindow) {
    overlayWindow.focus();
  }
});

/**
 * Check if window is focused
 * 
 * IPC Handler: 'window:isFocused'
 */
ipcMain.handle('window:isFocused', () => {
  if (overlayWindow) {
    return overlayWindow.isFocused();
  }
  return false;
});

// ============ IPC HANDLERS (SETTINGS) ============

/**
 * Get all settings
 * 
 * IPC Handler: 'settings:getAll'
 */
ipcMain.handle('settings:getAll', async () => {
  try {
    const settings = await db.query('SELECT key, value FROM settings');
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return result;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
});

/**
 * Set setting
 * 
 * IPC Handler: 'settings:set'
 */
ipcMain.handle('settings:set', async (event, { key, value }) => {
  try {
    await db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, JSON.stringify(value)]
    );
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
});

/**
 * Get setting value
 * 
 * IPC Handler: 'settings:get'
 */
ipcMain.handle('settings:get', async (event, { key, defaultValue }) => {
  try {
    const setting = await db.queryOne(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return setting ? JSON.parse(setting.value) : defaultValue;
  } catch (error) {
    console.error('Error getting setting:', error);
    return defaultValue;
  }
});

/**
 * Toggle dark mode
 * 
 * IPC Handler: 'settings:toggleDarkMode'
 */
ipcMain.handle('settings:toggleDarkMode', async () => {
  try {
    const current = await ipcMain.invoke('settings:get', {
      key: 'darkMode',
      defaultValue: true,
    });
    const newValue = !current;
    await ipcMain.invoke('settings:set', { key: 'darkMode', value: newValue });
    return newValue;
  } catch (error) {
    console.error('Error toggling dark mode:', error);
    throw error;
  }
});

/**
 * Get app version
 * 
 * IPC Handler: 'settings:getAppVersion'
 */
ipcMain.handle('settings:getAppVersion', () => {
  return app.getVersion();
});

// ============ SYSTEM TRAY ============

/**
 * Create system tray menu
 * 
 * Provides quick access to app from system tray
 */
function createTrayMenu() {
  // Get app icon (placeholder, use actual icon in production)
  const iconPath = path.join(__dirname, '../assets/icon.png');

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (overlayWindow) {
          overlayWindow.show();
          overlayWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('ClipNest AI');

  // Toggle on tray click
  tray.on('click', () => {
    toggleOverlay();
  });
}

// Export for testing
module.exports = {
  createOverlayWindow,
  toggleOverlay,
};
