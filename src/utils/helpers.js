/**
 * UTILITIES FOR REACT COMPONENTS
 * ==============================
 * 
 * Helper functions and utilities for common operations
 */

/**
 * Format file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text to specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Get time difference in human-readable format
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) return 'Just now';

  // Less than an hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString();
}

/**
 * Copy text to clipboard (system)
 * 
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
export async function copyToSystemClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy:', error);
    throw error;
  }
}

/**
 * Generate a color based on a string (for consistent coloring)
 * 
 * @param {string} str - String to hash
 * @returns {string} Hex color (e.g., "#3F51B5")
 */
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
}

/**
 * Debounce a function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if a URL is valid
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * 
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Check if text is code (heuristic)
 * 
 * @param {string} text - Text to check
 * @returns {boolean} True if likely code
 */
export function isLikelyCode(text) {
  if (!text) return false;

  const codePatterns = [
    /^[a-zA-Z_$][\w$]*\s*[=({]/,      // Variable assignment
    /^\s*(function|class|const|let|var|def|import|export|async|await)\s/, // Keywords
    /[{}();[\]]/,                      // Brackets
    /<[a-z]+[\s\>]/i,                 // HTML tags
    /\b(return|if|else|for|while|switch)\b/, // Control flow
  ];

  return codePatterns.some(pattern => pattern.test(text));
}

/**
 * Highlight code syntax (simple version)
 * For production, use a library like highlight.js
 * 
 * @param {string} code - Code string
 * @returns {string} HTML with syntax highlighting
 */
export function highlightCode(code) {
  // This is a placeholder - use highlight.js in production
  return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

/**
 * Escape HTML special characters
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate unique ID
 * 
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 11) +
         Math.random().toString(36).substring(2, 11);
}

/**
 * Sleep for specified milliseconds
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch array into chunks
 * 
 * @param {Array} array - Array to batch
 * @param {number} size - Batch size
 * @returns {Array<Array>} Batched array
 */
export function batchArray(array, size = 10) {
  const batches = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

/**
 * Retry a promise-returning function
 * 
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise<any>} Result or error
 */
export async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay);
    }
  }
}
