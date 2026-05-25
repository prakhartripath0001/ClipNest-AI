/**
 * DATABASE SCHEMA
 * ===============
 * This file contains all SQL schema definitions for ClipNest AI database.
 * 
 * Tables:
 * 1. clipboard_items - Stores all clipboard history entries
 * 2. tags - Stores user-defined tags for categorization
 * 3. favorites - Stores favorited clipboard items
 * 
 * The database uses SQLite3 for local persistent storage.
 */

// Schema for clipboard history table
// This is the main table storing all clipboard items
const CLIPBOARD_ITEMS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS clipboard_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('text', 'image', 'code', 'url')),
    content TEXT,
    file_path TEXT,
    preview TEXT,
    source TEXT DEFAULT 'clipboard',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accessed_at DATETIME,
    access_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    metadata TEXT
  );
`;

// Schema for tags table
// Allows users to tag and categorize clipboard items
const TAGS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Schema for item-tag relationships (many-to-many)
const ITEM_TAGS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS item_tags (
    item_id TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES clipboard_items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`;

// Schema for app settings/configuration
const SETTINGS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create indexes for better query performance
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_clipboard_created_at ON clipboard_items(created_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_clipboard_type ON clipboard_items(type);',
  'CREATE INDEX IF NOT EXISTS idx_clipboard_is_favorite ON clipboard_items(is_favorite);',
  'CREATE INDEX IF NOT EXISTS idx_clipboard_is_pinned ON clipboard_items(is_pinned);',
];

module.exports = {
  CLIPBOARD_ITEMS_SCHEMA,
  TAGS_SCHEMA,
  ITEM_TAGS_SCHEMA,
  SETTINGS_SCHEMA,
  INDEXES,
};
