/**
 * CLIPBOARD MONITORING SERVICE
 * ============================
 * 
 * This service monitors system clipboard for changes and automatically
 * saves new clipboard items to the database.
 * 
 * Features:
 * - Detects clipboard text changes
 * - Detects clipboard image changes
 * - Prevents duplicate entries
 * - Handles different content types
 * - Efficient polling mechanism
 * 
 * Usage:
 * const clipboardService = require('./clipboardService');
 * clipboardService.startMonitoring();
 */

const { clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { addClipboardItem } = require('../database/operations');
const { v4: uuidv4 } = require('uuid');

// Track last clipboard content to detect changes
let lastClipboardContent = null;
let lastImageHash = null;
let monitoringInterval = null;
const POLLING_INTERVAL = 1000; // Check clipboard every 1 second

/**
 * Get hash of image for duplicate detection
 * 
 * @param {NativeImage} image - Electron NativeImage object
 * @returns {string} Simple hash of image
 * @private
 */
function getImageHash(image) {
  // Get image size and format as simple hash
  const size = image.getSize();
  return `${size.width}x${size.height}`;
}

/**
 * Detect content type of clipboard item
 * 
 * @returns {string} Content type: 'text', 'image', 'url', 'code'
 * @private
 */
function detectContentType(text) {
  if (!text) return 'text';

  // URL detection
  if (/^https?:\/\//.test(text)) {
    return 'url';
  }

  // Code snippet detection (check for programming syntax)
  if (
    /^[a-zA-Z_$][\w$]*\s*[=({]/.test(text) || // variable assignment
    /^\s*(function|class|const|let|var|def|import|export)\s/.test(text) || // keywords
    /[{}();[\]]/.test(text) // brackets
  ) {
    return 'code';
  }

  return 'text';
}

/**
 * Create preview text from content
 * 
 * Truncates long text to first 100 characters
 * 
 * @param {string} text - Content to preview
 * @returns {string} Preview text
 * @private
 */
function createPreview(text) {
  if (!text) return '';
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

/**
 * Save image from clipboard to file system
 * 
 * @async
 * @param {NativeImage} image - Electron NativeImage
 * @param {string} screenshotFolder - Path to save screenshots
 * @returns {Promise<string>} Path to saved image
 * @private
 */
async function saveClipboardImage(image, screenshotFolder) {
  try {
    // Ensure screenshot folder exists
    await fs.mkdir(screenshotFolder, { recursive: true });

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `clipboard-${timestamp}.png`;
    const filepath = path.join(screenshotFolder, filename);

    // Get PNG buffer and save
    const buffer = image.toPNG();
    await fs.writeFile(filepath, buffer);

    console.log('Clipboard image saved:', filepath);
    return filepath;
  } catch (error) {
    console.error('Error saving clipboard image:', error);
    throw error;
  }
}

/**
 * Check clipboard for changes and save new items
 * 
 * This function is called on an interval to detect clipboard changes.
 * 
 * @async
 * @param {string} screenshotFolder - Path for saving images
 * @returns {Promise<void>}
 * @private
 */
async function checkClipboardChange(screenshotFolder) {
  try {
    // Check for text in clipboard
    const text = clipboard.readText();
    
    if (text && text !== lastClipboardContent) {
      console.log('New clipboard text detected');

      const type = detectContentType(text);
      const preview = createPreview(text);

      // Add to database
      await addClipboardItem({
        type,
        content: text,
        preview,
        source: 'clipboard',
        metadata: { detectedType: type },
      });

      lastClipboardContent = text;
      return; // Don't check for image if text was found
    }

    // Check for image in clipboard (only if no text)
    // Images in clipboard are detected separately
    const image = clipboard.readImage();
    if (!image.isEmpty()) {
      const imageHash = getImageHash(image);

      if (imageHash !== lastImageHash) {
        console.log('New clipboard image detected');

        const screenshotPath = await saveClipboardImage(image, screenshotFolder);
        
        // Add image to database
        await addClipboardItem({
          type: 'image',
          filePath: screenshotPath,
          preview: 'Image pasted from clipboard',
          source: 'clipboard',
          metadata: {
            width: image.getSize().width,
            height: image.getSize().height,
          },
        });

        lastImageHash = imageHash;
        lastClipboardContent = null; // Clear text cache
      }
    }
  } catch (error) {
    console.error('Error checking clipboard:', error);
  }
}

/**
 * Start clipboard monitoring
 * 
 * Begins polling clipboard for changes and saving them to database.
 * This should be called after Electron app is ready.
 * 
 * @param {string} [screenshotFolder] - Folder for saving images (optional)
 */
function startMonitoring(screenshotFolder = null) {
  if (!screenshotFolder) {
    const { app } = require('electron');
    screenshotFolder = path.join(app.getPath('userData'), 'screenshots');
  }

  console.log('Starting clipboard monitoring...');

  // Clear any existing interval
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }

  // Set up polling interval
  monitoringInterval = setInterval(() => {
    checkClipboardChange(screenshotFolder);
  }, POLLING_INTERVAL);

  console.log(`Clipboard monitoring active (checking every ${POLLING_INTERVAL}ms)`);
}

/**
 * Stop clipboard monitoring
 */
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('Clipboard monitoring stopped');
  }
}

/**
 * Copy text to clipboard
 * 
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  clipboard.writeText(text);
  lastClipboardContent = text;
}

/**
 * Copy image to clipboard
 * 
 * @param {string} imagePath - Path to image file
 */
async function copyImageToClipboard(imagePath) {
  try {
    const { nativeImage } = require('electron');
    const image = nativeImage.createFromPath(imagePath);
    
    if (!image.isEmpty()) {
      clipboard.writeImage(image);
      lastImageHash = getImageHash(image);
      console.log('Image copied to clipboard');
    }
  } catch (error) {
    console.error('Error copying image to clipboard:', error);
    throw error;
  }
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  copyToClipboard,
  copyImageToClipboard,
};
