/**
 * CUSTOM HOOKS
 * ============
 * 
 * useClipboard - Manage clipboard items
 * useSettings - Manage app settings
 * useSearch - Manage search functionality
 * useDarkMode - Manage dark mode state
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage clipboard items
 * 
 * @returns {Object} Clipboard state and methods
 * 
 * Methods:
 * - getItems(limit, offset) - Fetch items
 * - copy(id) - Copy item to clipboard
 * - delete(id) - Delete item
 * - toggleFavorite(id) - Toggle favorite
 * - getFavorites() - Get favorite items
 * - search(query, type) - Search items
 * 
 * State:
 * - items - Array of clipboard items
 * - loading - Loading state
 * - error - Error message
 */
export function useClipboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getItems = useCallback(async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      // Check if window.api is available (running in Electron)
      if (!window.api || !window.api.clipboard) {
        console.warn('window.api not available - running in dev mode without Electron');
        setItems([]);
        return;
      }
      const data = await window.api.clipboard.getItems(limit, offset);
      setItems(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = useCallback(async (id) => {
    if (!window.api || !window.api.clipboard) {
      console.warn('window.api not available');
      return;
    }
    try {
      await window.api.clipboard.copy(id);
      console.log('Item copied:', id);
    } catch (err) {
      setError(err.message);
      console.error('Error copying:', err);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    if (!window.api || !window.api.clipboard) {
      console.warn('window.api not available');
      return;
    }
    try {
      await window.api.clipboard.delete(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting:', err);
    }
  }, [items]);

  const toggleFavorite = useCallback(async (id) => {
    if (!window.api || !window.api.clipboard) {
      console.warn('window.api not available');
      return;
    }
    try {
      const updated = await window.api.clipboard.toggleFavorite(id);
      setItems(items.map(item => item.id === id ? updated : item));
    } catch (err) {
      setError(err.message);
    }
  }, [items]);

  const getFavorites = useCallback(async () => {
    if (!window.api || !window.api.clipboard) {
      console.warn('window.api not available');
      return [];
    }
    try {
      setLoading(true);
      const data = await window.api.clipboard.getFavorites();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query, type = null) => {
    try {
      setLoading(true);
      const data = await window.api.clipboard.search(query, type);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    getItems,
    copy,
    deleteItem,
    toggleFavorite,
    getFavorites,
    search,
  };
}

/**
 * Hook to manage app settings
 * 
 * @returns {Object} Settings state and methods
 */
export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.api || !window.api.settings) {
        console.warn('window.api not available');
        return {};
      }
      const data = await window.api.settings.getAll();
      setSettings(data);
      return data;
    } catch (err) {
      console.error('Error getting settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const set = useCallback(async (key, value) => {
    try {
      if (!window.api || !window.api.settings) {
        console.warn('window.api not available');
        return;
      }
      await window.api.settings.set(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error('Error setting value:', err);
    }
  }, []);

  const get = useCallback(async (key, defaultValue) => {
    try {
      if (!window.api || !window.api.settings) {
        console.warn('window.api not available');
        return defaultValue;
      }
      return await window.api.settings.get(key, defaultValue);
    } catch (err) {
      console.error('Error getting setting:', err);
      return defaultValue;
    }
  }, []);

  return {
    settings,
    loading,
    getAll,
    set,
    get,
  };
}

/**
 * Hook to manage dark mode
 * 
 * @returns {Object} Dark mode state and toggle method
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update DOM
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  return {
    isDark,
    toggle,
  };
}

/**
 * Hook for managing clipboard updates from IPC
 * 
 * @param {Function} callback - Called when clipboard updates
 */
export function useClipboardListener(callback) {
  useEffect(() => {
    // Check if window.api is available (running in Electron)
    if (!window.api || !window.api.onClipboardUpdate) {
      console.warn('window.api.onClipboardUpdate not available - running in dev mode without Electron');
      return () => {};
    }
    const unsubscribe = window.api.onClipboardUpdate(callback);
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook for keyboard shortcuts within the app
 * 
 * @param {string} key - Key to listen for (e.g., 'Enter', 'Escape')
 * @param {Function} callback - Called when key pressed
 */
export function useKeyPress(key, callback) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === key) {
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}
