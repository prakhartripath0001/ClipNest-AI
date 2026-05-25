/**
 * DATABASE OPERATIONS
 * ===================
 * 
 * High-level database operations for clipboard items.
 * This module provides clean API methods for CRUD operations.
 * 
 * Functions:
 * - addClipboardItem
 * - getClipboardItems
 * - deleteClipboardItem
 * - updateClipboardItem
 * - searchClipboardItems
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

/**
 * Add a new clipboard item to database
 * 
 * @async
 * @param {Object} item - Clipboard item object
 * @param {string} item.type - Type of item: 'text', 'image', 'code', 'url'
 * @param {string} item.content - Text content of clipboard item
 * @param {string} [item.filePath] - File path for images/files
 * @param {string} [item.preview] - Preview text/thumbnail data
 * @param {string} [item.source] - Source of item: 'clipboard', 'screenshot'
 * @param {Object} [item.metadata] - Additional metadata as JSON
 * @returns {Promise<Object>} Created item with ID
 * 
 * Example:
 * const item = await addClipboardItem({
 *   type: 'text',
 *   content: 'copied text here',
 *   source: 'clipboard'
 * });
 */
async function addClipboardItem(item) {
  const id = uuidv4();
  const {
    type = 'text',
    content = '',
    filePath = null,
    preview = null,
    source = 'clipboard',
    metadata = null,
  } = item;

  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  const sql = `
    INSERT INTO clipboard_items 
    (id, type, content, file_path, preview, source, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.run(sql, [id, type, content, filePath, preview, source, metadataJson]);
    
    // Limit total items in database to MAX_CLIPBOARD_ITEMS (100)
    // Delete oldest items when limit is exceeded
    await enforceMaxItems(100);

    return { id, type, content, filePath, preview, source, createdAt: new Date() };
  } catch (error) {
    console.error('Error adding clipboard item:', error);
    throw error;
  }
}

/**
 * Get clipboard items with pagination
 * 
 * @async
 * @param {number} limit - Maximum items to return (default: 20)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Array of clipboard items
 * 
 * Example:
 * const items = await getClipboardItems(20, 0);
 */
async function getClipboardItems(limit = 20, offset = 0) {
  const sql = `
    SELECT * FROM clipboard_items 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  try {
    return await db.query(sql, [limit, offset]);
  } catch (error) {
    console.error('Error getting clipboard items:', error);
    throw error;
  }
}

/**
 * Get a single clipboard item by ID
 * 
 * @async
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Clipboard item
 */
async function getClipboardItemById(id) {
  const sql = 'SELECT * FROM clipboard_items WHERE id = ?';

  try {
    return await db.queryOne(sql, [id]);
  } catch (error) {
    console.error('Error getting clipboard item:', error);
    throw error;
  }
}

/**
 * Delete a clipboard item by ID
 * 
 * @async
 * @param {string} id - Item ID to delete
 * @returns {Promise<Object>} Result object with changes count
 */
async function deleteClipboardItem(id) {
  const sql = 'DELETE FROM clipboard_items WHERE id = ?';

  try {
    // If item has associated file, delete it
    const item = await getClipboardItemById(id);
    if (item && item.file_path) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(item.file_path);
      } catch (e) {
        console.warn('Could not delete file:', item.file_path);
      }
    }

    return await db.run(sql, [id]);
  } catch (error) {
    console.error('Error deleting clipboard item:', error);
    throw error;
  }
}

/**
 * Update clipboard item
 * 
 * @async
 * @param {string} id - Item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Result object
 */
async function updateClipboardItem(id, updates) {
  const allowedFields = ['content', 'preview', 'is_favorite', 'is_pinned', 'accessed_at', 'access_count'];
  const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  values.push(id);

  const sql = `UPDATE clipboard_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  try {
    return await db.run(sql, values);
  } catch (error) {
    console.error('Error updating clipboard item:', error);
    throw error;
  }
}

/**
 * Search clipboard items
 * 
 * Searches across:
 * - content (text content)
 * - preview (thumbnail text)
 * - type (item type)
 * 
 * @async
 * @param {string} searchTerm - Search query
 * @param {string} [type] - Filter by type: 'text', 'image', 'code', 'url'
 * @param {number} [limit] - Max results (default: 20)
 * @returns {Promise<Array>} Search results
 * 
 * Example:
 * const results = await searchClipboardItems('python', 'code', 10);
 */
async function searchClipboardItems(searchTerm, type = null, limit = 20) {
  let sql = `
    SELECT * FROM clipboard_items 
    WHERE (content LIKE ? OR preview LIKE ?)
  `;
  const params = [`%${searchTerm}%`, `%${searchTerm}%`];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  try {
    return await db.query(sql, params);
  } catch (error) {
    console.error('Error searching clipboard items:', error);
    throw error;
  }
}

/**
 * Get clipboard items by type
 * 
 * @async
 * @param {string} type - Item type: 'text', 'image', 'code', 'url'
 * @param {number} [limit] - Max results (default: 20)
 * @returns {Promise<Array>} Items of specified type
 */
async function getClipboardItemsByType(type, limit = 20) {
  const sql = `
    SELECT * FROM clipboard_items 
    WHERE type = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  try {
    return await db.query(sql, [type, limit]);
  } catch (error) {
    console.error('Error getting items by type:', error);
    throw error;
  }
}

/**
 * Toggle favorite status of an item
 * 
 * @async
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Updated item
 */
async function toggleFavorite(id) {
  const item = await getClipboardItemById(id);
  if (!item) throw new Error('Item not found');

  await updateClipboardItem(id, {
    is_favorite: item.is_favorite ? 0 : 1,
  });

  return await getClipboardItemById(id);
}

/**
 * Get favorite items
 * 
 * @async
 * @param {number} [limit] - Max results
 * @returns {Promise<Array>} Favorite items
 */
async function getFavoriteItems(limit = 20) {
  const sql = `
    SELECT * FROM clipboard_items 
    WHERE is_favorite = 1 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  try {
    return await db.query(sql, [limit]);
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
}

/**
 * Enforce maximum number of clipboard items in database
 * Deletes oldest items when limit is exceeded
 * 
 * @async
 * @param {number} maxItems - Maximum items to keep
 * @returns {Promise<void>}
 * @private
 */
async function enforceMaxItems(maxItems) {
  const countSql = 'SELECT COUNT(*) as count FROM clipboard_items';
  const result = await db.queryOne(countSql);

  if (result && result.count > maxItems) {
    const deleteCount = result.count - maxItems;
    const deleteSql = `
      DELETE FROM clipboard_items 
      WHERE id IN (
        SELECT id FROM clipboard_items 
        WHERE is_pinned = 0 
        ORDER BY access_count, accessed_at, created_at ASC 
        LIMIT ?
      )
    `;

    try {
      await db.run(deleteSql, [deleteCount]);
      console.log(`Cleaned up ${deleteCount} old clipboard items`);
    } catch (error) {
      console.error('Error enforcing max items:', error);
    }
  }
}

/**
 * Clear all clipboard history (non-favorite items)
 * 
 * @async
 * @returns {Promise<Object>} Result with changes count
 */
async function clearClipboardHistory() {
  const sql = 'DELETE FROM clipboard_items WHERE is_favorite = 0';

  try {
    return await db.run(sql);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}

module.exports = {
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
};
