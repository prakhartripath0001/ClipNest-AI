/**
 * SEARCH BAR COMPONENT
 * ====================
 * 
 * Search and filter clipboard items
 * 
 * Features:
 * - Real-time search as you type
 * - Filter by type (text/code/image/url)
 * - Keyboard shortcut (Ctrl+K or Cmd+K)
 * - Focus management
 * 
 * Props:
 * - onSearch: Callback with search query and type
 * - onClear: Callback when search is cleared
 * - isLoading: Loading state for search
 */

import React, { useState, useEffect } from 'react';

const TYPE_FILTERS = [
  { value: null, label: 'All' },
  { value: 'text', label: '📝 Text' },
  { value: 'code', label: '💻 Code' },
  { value: 'image', label: '🖼️ Image' },
  { value: 'url', label: '🔗 URL' },
];

export function SearchBar({ onSearch, onClear, isLoading }) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      onSearch(value, selectedType);
    } else if (value.length === 0 && query.length > 0) {
      onClear();
    }
  };

  // Handle type filter change
  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (query.length > 0) {
      onSearch(query, type);
    }
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-3 mb-4">
      {/* Search input */}
      <div className="relative">
        <input
          id="search-input"
          type="text"
          placeholder="Search clipboard... (Cmd+K)"
          value={query}
          onChange={handleSearchChange}
          className="input pl-10 pr-4"
          disabled={isLoading}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          🔍
        </span>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onClear();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedType === type.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
