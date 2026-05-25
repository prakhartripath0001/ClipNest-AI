/**
 * MAIN APP COMPONENT
 * ==================
 * 
 * Root React component that orchestrates all features:
 * - Clipboard item display
 * - Search and filtering
 * - Dark mode
 * - Real-time updates
 * - Keyboard navigation
 * 
 * Architecture:
 * App
 *   └─ Header (controls)
 *   └─ SearchBar (search & filters)
 *   └─ ClipboardList (items)
 *   └─ Footer (stats)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ClipboardList } from './components/ClipboardList';
import { useClipboard, useDarkMode, useClipboardListener, useKeyPress } from './hooks/useClipboard';
import './styles/globals.css';

function App() {
  const {
    items,
    loading,
    error,
    getItems,
    copy,
    deleteItem,
    toggleFavorite,
    getFavorites,
    search,
  } = useClipboard();

  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  // Tab state: 'recent' or 'favorites'
  const [activeTab, setActiveTab] = useState('recent');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load initial items
  useEffect(() => {
    if (activeTab === 'recent') {
      getItems(20, 0);
    } else {
      getFavorites();
    }
  }, [activeTab]);

  // Listen for clipboard updates from main process
  useClipboardListener((newItem) => {
    console.log('New clipboard item:', newItem);
    // Prepend new item to list
    if (activeTab === 'recent') {
      setOffset(0);
      getItems(20, 0);
    }
  });

  // Load more items (pagination)
  const handleLoadMore = useCallback(() => {
    if (activeTab === 'recent') {
      const newOffset = offset + 20;
      getItems(20, newOffset);
      setOffset(newOffset);
    }
  }, [offset, activeTab, getItems]);

  // Handle search
  const handleSearch = useCallback((query, type) => {
    search(query, type);
    setHasMore(false);
  }, [search]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    if (activeTab === 'recent') {
      getItems(20, 0);
    } else {
      getFavorites();
    }
  }, [activeTab, getItems, getFavorites]);

  // Keyboard shortcuts
  useKeyPress('Escape', () => {
    window.api.window.close();
  });

  return (
    <div className={`${isDark ? 'dark' : 'light'} w-full h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}>
      {/* Header */}
      <Header
        isDarkMode={isDark}
        onDarkModeToggle={toggleDarkMode}
        onClose={() => window.api.window.close()}
        onSettings={() => console.log('Settings clicked')}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'recent'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              }`}
            >
              📋 Recent
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              }`}
            >
              ⭐ Favorites
            </button>
          </div>

          {/* Search bar */}
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={loading}
          />
        </div>

        {/* Clipboard list */}
        <div className="flex-1 overflow-auto px-4 py-4">
          <ClipboardList
            items={items}
            loading={loading}
            error={error}
            onCopy={copy}
            onDelete={deleteItem}
            onToggleFavorite={toggleFavorite}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </div>
      </main>

      {/* Footer with stats */}
      <footer className="border-t border-slate-200 dark:border-slate-700 p-3 text-center text-sm text-slate-500 dark:text-slate-400">
        {items.length > 0 && (
          <>
            <span>🔄 {items.length} items</span>
            <span className="mx-2">•</span>
            <span>⌨️ Esc to close • Cmd+K to search</span>
          </>
        )}
      </footer>
    </div>
  );
}

export default App;
