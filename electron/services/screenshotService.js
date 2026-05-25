/**
 * SCREENSHOT DETECTION SERVICE
 * ============================
 * 
 * This service monitors the file system for new screenshots.
 * It automatically detects and stores screenshots in database.
 * 
 * Features:
 * - Monitors macOS/Windows/Linux screenshot folders
 * - Detects new screenshot files
 * - Extracts OCR text from screenshots
 * - Prevents duplicates
 * - Stores as clipboard items
 * 
 * Usage:
 * const screenshotService = require('./screenshotService');
 * screenshotService.startMonitoring();
 */

const path = require('path');
const fs = require('fs').promises;
const { watch } = require('fs');
const os = require('os');
const { addClipboardItem } = require('../database/operations');
const { extractTextFromImage } = require('./ocrService');
const crypto = require('crypto');

// Track processed screenshots to avoid duplicates
const processedScreenshots = new Map();
let screenshotWatcher = null;
let screenshotFolder = null;

/**
 * Get default screenshot folder for current OS
 * 
 * @returns {string} Path to screenshots folder
 * @private
 */
function getDefaultScreenshotFolder() {
  const platform = os.platform();
  const home = os.homedir();

  switch (platform) {
    case 'darwin': // macOS
      return path.join(home, 'Desktop'); // macOS saves to Desktop by default
    case 'win32': // Windows
      return path.join(home, 'Pictures', 'Screenshots');
    case 'linux': // Linux
      return path.join(home, 'Pictures');
    default:
      return path.join(home, 'Pictures');
  }
}

/**
 * Get hash of file for duplicate detection
 * 
 * @async
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File hash
 * @private
 */
async function getFileHash(filePath) {
  try {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (error) {
    console.error('Error calculating file hash:', error);
    return null;
  }
}

/**
 * Check if file is a screenshot image
 * 
 * @param {string} filename - Filename to check
 * @returns {boolean} True if likely a screenshot
 * @private
 */
function isScreenshot(filename) {
  const screenshotPatterns = [
    /Screenshot/i,
    /Screen Shot/i,
    /Capture/i,
    /screenshot/i,
  ];

  const extension = path.extname(filename).toLowerCase();
  const isImageFile = ['.png', '.jpg', '.jpeg', '.bmp'].includes(extension);

  const isScreenshotNamed = screenshotPatterns.some(pattern => pattern.test(filename));

  return isImageFile && isScreenshotNamed;
}

/**
 * Get file size in bytes
 * 
 * @async
 * @param {string} filePath - File path
 * @returns {Promise<number>} File size
 * @private
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Create preview image (thumbnail) from screenshot
 * 
 * In a production app, you'd use a library like 'sharp' to create thumbnails.
 * For now, we store the file path.
 * 
 * @async
 * @param {string} filePath - Path to screenshot
 * @returns {Promise<string>} Preview data or path
 * @private
 */
async function createScreenshotPreview(filePath) {
  // In production, you could use 'sharp' to create a thumbnail
  // For now, we'll return the file path as preview
  return filePath;
}

/**
 * Process a new screenshot file
 * 
 * @async
 * @param {string} filePath - Path to screenshot file
 * @returns {Promise<void>}
 * @private
 */
async function processScreenshot(filePath) {
  try {
    // Check if file exists and is readable
    await fs.access(filePath);

    // Calculate file hash for duplicate detection
    const fileHash = await getFileHash(filePath);
    if (!fileHash) return;

    // Skip if already processed
    if (processedScreenshots.has(fileHash)) {
      console.log('Screenshot already processed:', filePath);
      return;
    }

    // Mark as processed
    processedScreenshots.set(fileHash, true);

    console.log('Processing new screenshot:', filePath);

    // Extract text from screenshot using OCR
    let ocrText = null;
    try {
      ocrText = await extractTextFromImage(filePath);
    } catch (error) {
      console.warn('OCR failed for screenshot:', error.message);
    }

    // Get file size
    const fileSize = await getFileSize(filePath);

    // Create preview
    const preview = await createScreenshotPreview(filePath);

    // Add to database
    await addClipboardItem({
      type: 'image',
      filePath,
      preview,
      source: 'screenshot',
      content: ocrText, // Store OCR text as content for searching
      metadata: {
        size: fileSize,
        ocrText: ocrText || null,
      },
    });

    console.log('Screenshot saved to database:', filePath);
  } catch (error) {
    console.error('Error processing screenshot:', error);
  }
}

/**
 * Start monitoring screenshot folder
 * 
 * Watches the system screenshot folder for new files.
 * 
 * @param {string} [folder] - Folder to monitor (optional, uses default)
 */
function startMonitoring(folder = null) {
  screenshotFolder = folder || getDefaultScreenshotFolder();

  console.log('Starting screenshot monitoring in:', screenshotFolder);

  try {
    // Use fs.watch to monitor folder
    screenshotWatcher = watch(screenshotFolder, { recursive: false }, (eventType, filename) => {
      if (eventType === 'change' && filename) {
        const filePath = path.join(screenshotFolder, filename);

        // Add small delay to ensure file is fully written
        setTimeout(() => {
          if (isScreenshot(filename)) {
            processScreenshot(filePath);
          }
        }, 500);
      }
    });

    console.log('Screenshot monitoring active');
  } catch (error) {
    console.error('Error starting screenshot monitoring:', error);
    // Continue without screenshot monitoring if it fails
  }
}

/**
 * Stop monitoring screenshot folder
 */
function stopMonitoring() {
  if (screenshotWatcher) {
    screenshotWatcher.close();
    screenshotWatcher = null;
    console.log('Screenshot monitoring stopped');
  }
}

/**
 * Get screenshot folder path
 * 
 * @returns {string} Current screenshot folder path
 */
function getScreenshotFolder() {
  return screenshotFolder || getDefaultScreenshotFolder();
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  getScreenshotFolder,
  isScreenshot,
};
