/**
 * OCR SERVICE
 * ===========
 * 
 * Provides Optical Character Recognition (OCR) functionality
 * to extract text from images and screenshots.
 * 
 * Uses Tesseract.js for cross-platform text recognition.
 * 
 * Features:
 * - Extract text from PNG, JPG images
 * - Support for multiple languages
 * - Caching of results
 * - Async processing
 * 
 * Usage:
 * const ocrService = require('./ocrService');
 * const text = await ocrService.extractTextFromImage('./screenshot.png');
 */

const Tesseract = require('tesseract.js');
const path = require('path');

// Cache OCR results to avoid re-processing same images
const ocrCache = new Map();

/**
 * Extract text from image file using OCR
 * 
 * @async
 * @param {string} imagePath - Path to image file
 * @param {string} [language] - Language code (default: 'eng' for English)
 * @returns {Promise<string>} Extracted text
 * 
 * Example:
 * const text = await extractTextFromImage('./screenshot.png');
 * // Returns: "Extracted text from image"
 */
async function extractTextFromImage(imagePath, language = 'eng') {
  try {
    // Check cache first
    if (ocrCache.has(imagePath)) {
      console.log('Using cached OCR result for:', imagePath);
      return ocrCache.get(imagePath);
    }

    console.log('Extracting text from image:', imagePath);

    // Use Tesseract.js to recognize text
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, language, {
      // logger: (m) => console.log('OCR Progress:', m), // Uncomment to see progress
    });

    // Cache result
    ocrCache.set(imagePath, text);

    // Keep cache size manageable (max 100 entries)
    if (ocrCache.size > 100) {
      const firstKey = ocrCache.keys().next().value;
      ocrCache.delete(firstKey);
    }

    console.log('OCR extraction complete. Text length:', text.length);
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Extract text with a progress callback
 * 
 * Useful for showing progress to user during long OCR operations.
 * 
 * @async
 * @param {string} imagePath - Path to image
 * @param {Function} progressCallback - Called with progress updates
 * @param {string} [language] - Language code
 * @returns {Promise<string>} Extracted text
 * 
 * Example:
 * const text = await extractTextWithProgress(
 *   './image.png',
 *   (progress) => console.log(`OCR ${progress.status}: ${progress.progress}`)
 * );
 */
async function extractTextWithProgress(imagePath, progressCallback, language = 'eng') {
  try {
    // Check cache first
    if (ocrCache.has(imagePath)) {
      progressCallback?.({ status: 'cached', progress: 1 });
      return ocrCache.get(imagePath);
    }

    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, language, {
      logger: (m) => {
        progressCallback?.({
          status: m.status,
          progress: m.progress,
        });
      },
    });

    // Cache result
    ocrCache.set(imagePath, text);

    return text;
  } catch (error) {
    console.error('Error in OCR with progress:', error);
    throw error;
  }
}

/**
 * Extract text from multiple images
 * 
 * Processes images sequentially for memory efficiency.
 * 
 * @async
 * @param {string[]} imagePaths - Array of image paths
 * @param {string} [language] - Language code
 * @returns {Promise<Object>} Map of path -> extracted text
 */
async function extractTextFromMultipleImages(imagePaths, language = 'eng') {
  const results = {};

  for (const imagePath of imagePaths) {
    try {
      results[imagePath] = await extractTextFromImage(imagePath, language);
    } catch (error) {
      console.error(`Failed to extract text from ${imagePath}:`, error);
      results[imagePath] = null;
    }
  }

  return results;
}

/**
 * Clear OCR cache
 * 
 * Useful for memory management in long-running applications.
 */
function clearCache() {
  ocrCache.clear();
  console.log('OCR cache cleared');
}

/**
 * Get cache size
 * 
 * @returns {number} Number of cached OCR results
 */
function getCacheSize() {
  return ocrCache.size;
}

module.exports = {
  extractTextFromImage,
  extractTextWithProgress,
  extractTextFromMultipleImages,
  clearCache,
  getCacheSize,
};
