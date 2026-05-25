/**
 * HEADER COMPONENT
 * ================
 * 
 * Top header with branding, settings, and controls
 * 
 * Features:
 * - App title and logo
 * - Dark mode toggle
 * - Settings menu
 * - Close button
 */

import React from 'react';

export function Header({ isDarkMode, onDarkModeToggle, onClose, onSettings }) {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between rounded-t-lg">
      {/* Logo and title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <h1 className="text-lg font-bold">ClipNest AI</h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onDarkModeToggle}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Settings */}
        <button
          onClick={onSettings}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Settings"
        >
          ⚙️
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Close"
        >
          ✕
        </button>
      </div>
    </header>
  );
}
