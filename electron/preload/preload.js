/**
 * ELECTRON PRELOAD SCRIPT
 * =======================
 * 
 * This script runs in a bridge between the Electron main process and the renderer process (React app).
 * 
 * It provides secure IPC communication channels using contextIsolation and sandbox.
 * This prevents malicious code from accessing Electron APIs directly.
 * 
 * Security Best Practices:
 * - Only expose necessary APIs
 * - Validate all arguments
 * - Use preload context isolation
 * - Never expose require() or process globally
 * 
 * The ipcRenderer object allows two-way communication with main process:
 * - invoke() - calls main process and waits for response (promise-based)
 * - send() - sends message to main process (fire and forget)
 * - on() - listens for messages from main process
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose secure IPC API to renderer process
 * 
 * Available methods:
 * - clipboard: get/set clipboard
 * - database: database operations
 * - app: app control operations
 * - shortcuts: keyboard shortcut management
 * - system: system operations
 */
contextBridge.exposeInMainWorld('api', {
  // ============ CLIPBOARD API ============
  clipboard: {
    /**
     * Get clipboard items with pagination
     * 
     * @param {number} limit - Items to fetch
     * @param {number} offset - Pagination offset
     * @returns {Promise<Array>} Clipboard items
     */
    getItems: (limit, offset) =>
      ipcRenderer.invoke('clipboard:getItems', { limit, offset }),

    /**
     * Get clipboard item by ID
     * 
     * @param {string} id - Item ID
     * @returns {Promise<Object>} Clipboard item
     */
    getItem: (id) => ipcRenderer.invoke('clipboard:getItem', { id }),

    /**
     * Copy clipboard item to system clipboard
     * 
     * @param {string} id - Item ID to copy
     * @returns {Promise<void>}
     */
    copy: (id) => ipcRenderer.invoke('clipboard:copy', { id }),

    /**
     * Delete clipboard item
     * 
     * @param {string} id - Item ID to delete
     * @returns {Promise<void>}
     */
    delete: (id) => ipcRenderer.invoke('clipboard:delete', { id }),

    /**
     * Search clipboard items
     * 
     * @param {string} query - Search term
     * @param {string} type - Filter by type (text/image/code/url)
     * @returns {Promise<Array>} Search results
     */
    search: (query, type) =>
      ipcRenderer.invoke('clipboard:search', { query, type }),

    /**
     * Get items by type
     * 
     * @param {string} type - Item type
     * @param {number} limit - Max items
     * @returns {Promise<Array>} Items of type
     */
    getByType: (type, limit) =>
      ipcRenderer.invoke('clipboard:getByType', { type, limit }),

    /**
     * Toggle favorite status
     * 
     * @param {string} id - Item ID
     * @returns {Promise<Object>} Updated item
     */
    toggleFavorite: (id) =>
      ipcRenderer.invoke('clipboard:toggleFavorite', { id }),

    /**
     * Get favorite items
     * 
     * @returns {Promise<Array>} Favorite items
     */
    getFavorites: () => ipcRenderer.invoke('clipboard:getFavorites'),

    /**
     * Clear clipboard history (non-favorite items)
     * 
     * @returns {Promise<void>}
     */
    clearHistory: () => ipcRenderer.invoke('clipboard:clearHistory'),
  },

  // ============ WINDOW API ============
  window: {
    /**
     * Close the overlay window
     */
    close: () => ipcRenderer.send('window:close'),

    /**
     * Minimize the window
     */
    minimize: () => ipcRenderer.send('window:minimize'),

    /**
     * Focus the window
     */
    focus: () => ipcRenderer.send('window:focus'),

    /**
     * Check if window is in focus
     * 
     * @returns {Promise<boolean>}
     */
    isFocused: () => ipcRenderer.invoke('window:isFocused'),
  },

  // ============ SETTINGS API ============
  settings: {
    /**
     * Get all settings
     * 
     * @returns {Promise<Object>} Settings object
     */
    getAll: () => ipcRenderer.invoke('settings:getAll'),

    /**
     * Set a setting value
     * 
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<void>}
     */
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),

    /**
     * Get setting value
     * 
     * @param {string} key - Setting key
     * @param {any} defaultValue - Default if not found
     * @returns {Promise<any>}
     */
    get: (key, defaultValue) =>
      ipcRenderer.invoke('settings:get', { key, defaultValue }),

    /**
     * Toggle dark mode
     * 
     * @returns {Promise<boolean>} New dark mode state
     */
    toggleDarkMode: () => ipcRenderer.invoke('settings:toggleDarkMode'),

    /**
     * Get app version
     * 
     * @returns {Promise<string>} Version string
     */
    getAppVersion: () => ipcRenderer.invoke('settings:getAppVersion'),
  },

  // ============ EVENT LISTENERS ============
  /**
   * Listen for clipboard updates from main process
   * 
   * Triggered when new item is added to clipboard
   * 
   * @param {Function} callback - Called with new item data
   * @returns {Function} Unsubscribe function
   */
  onClipboardUpdate: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('clipboard:updated', handler);
    return () => ipcRenderer.removeListener('clipboard:updated', handler);
  },

  /**
   * Listen for screenshot detected
   * 
   * @param {Function} callback - Called with screenshot data
   * @returns {Function} Unsubscribe function
   */
  onScreenshotDetected: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('screenshot:detected', handler);
    return () => ipcRenderer.removeListener('screenshot:detected', handler);
  },

  /**
   * Listen for shortcut triggered
   * 
   * @param {Function} callback - Called when shortcut pressed
   * @returns {Function} Unsubscribe function
   */
  onShortcutTriggered: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('shortcut:triggered', handler);
    return () => ipcRenderer.removeListener('shortcut:triggered', handler);
  },
});
