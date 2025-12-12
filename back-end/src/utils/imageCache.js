// Temporary image storage using memory (for testing)
// In production, should use cloud storage like S3, Cloudinary, etc.

const imageCache = new Map();

/**
 * Save image temporarily in memory
 * @param {string} base64Image - Base64 encoded image
 * @param {string} imageId - Unique identifier for the image
 * @returns {string} - The image ID
 */
export function saveImageTemporarily(base64Image, imageId) {
  imageCache.set(imageId, base64Image);
  
  // Auto cleanup after 5 minutes
  setTimeout(() => {
    imageCache.delete(imageId);
  }, 5 * 60 * 1000);
  
  return imageId;
}

/**
 * Get image from cache
 * @param {string} imageId - Image identifier
 * @returns {string|undefined} - Base64 image or undefined
 */
export function getImage(imageId) {
  return imageCache.get(imageId);
}

/**
 * Check if image exists in cache
 * @param {string} imageId - Image identifier
 * @returns {boolean}
 */
export function hasImage(imageId) {
  return imageCache.has(imageId);
}

/**
 * Delete image from cache
 * @param {string} imageId - Image identifier
 */
export function deleteImage(imageId) {
  imageCache.delete(imageId);
}

/**
 * Clear all cached images
 */
export function clearCache() {
  imageCache.clear();
}
