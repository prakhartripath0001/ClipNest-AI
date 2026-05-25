/**
 * DATABASE INITIALIZATION & CONNECTION
 * =====================================
 * 
 * This module handles SQLite database initialization and connection.
 * It creates tables, runs migrations, and provides database access.
 * 
 * Usage:
 * const db = require('./db');
 * await db.init();
 * const results = await db.query('SELECT * FROM clipboard_items');
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { ipcMain, app } = require('electron');
const {
  CLIPBOARD_ITEMS_SCHEMA,
  TAGS_SCHEMA,
  ITEM_TAGS_SCHEMA,
  SETTINGS_SCHEMA,
  INDEXES,
} = require('./schema');

// Database will be stored in user's data directory
// This ensures the database persists even after app updates
const DATABASE_PATH = path.join(app.getPath('userData'), 'clipnest_data');
const DB_FILE = path.join(DATABASE_PATH, 'clipnest.db');

let db = null;

/**
 * Initialize database connection and create tables
 * 
 * @async
 * @returns {Promise<void>}
 * 
 * Steps:
 * 1. Create database directory if it doesn't exist
 * 2. Connect to SQLite database
 * 3. Enable foreign keys for referential integrity
 * 4. Create all tables
 * 5. Create indexes for performance
 */
async function init() {
  return new Promise((resolve, reject) => {
    try {
      // Ensure database directory exists
      if (!fs.existsSync(DATABASE_PATH)) {
        fs.mkdirSync(DATABASE_PATH, { recursive: true });
      }

      // Create or open database file
      db = new sqlite3.Database(DB_FILE, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
          return;
        }

        console.log('Database connected at:', DB_FILE);

        // Enable foreign keys for data integrity
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Create all tables
          db.serialize(() => {
            // Create main tables
            db.run(CLIPBOARD_ITEMS_SCHEMA);
            db.run(TAGS_SCHEMA);
            db.run(ITEM_TAGS_SCHEMA);
            db.run(SETTINGS_SCHEMA);

            // Create indexes
            INDEXES.forEach((indexSQL) => {
              db.run(indexSQL);
            });

            console.log('Database tables created successfully');
            resolve();
          });
        });
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      reject(error);
    }
  });
}

/**
 * Execute a SQL query and return results as Promise
 * 
 * @async
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters (for prepared statements)
 * @returns {Promise<Array>} Array of result rows
 * 
 * Example:
 * const items = await query(
 *   'SELECT * FROM clipboard_items WHERE type = ? LIMIT 10',
 *   ['text']
 * );
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Execute a single row query
 * 
 * @async
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Single result row
 */
function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Query error:', err);
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE)
 * 
 * @async
 * @param {string} sql - SQL statement
 * @param {Array} params - Statement parameters
 * @returns {Promise<Object>} Result object with lastID and changes
 * 
 * Example:
 * const result = await run(
 *   'INSERT INTO clipboard_items (id, type, content) VALUES (?, ?, ?)',
 *   [uuid(), 'text', 'copied text']
 * );
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Run error:', err);
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes,
        });
      }
    });
  });
}

/**
 * Close database connection
 * 
 * @async
 * @returns {Promise<void>}
 */
function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  query,
  queryOne,
  run,
  close,
  getPath: () => DB_FILE,
};
