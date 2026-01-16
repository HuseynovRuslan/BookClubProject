// API Base URL - environment variable ilə konfiqurasiya olunur
const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7050';
const API_BASE_URL = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';

/**
 * Helper function to get the correct image URL
 * @param {string|null} imagePath - Image path from API (could be relative or absolute)
 * @param {string} baseURL - Base URL for the API
 * @returns {string|null} - Full image URL or null
 */
export const getImageUrl = (imagePath, baseURL = API_BASE_URL) => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  // If it's already a full URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Normalize path separators
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove leading slash if present (baseURL already ends with /)
  const cleanPath = normalizedPath.startsWith('/') 
    ? normalizedPath.substring(1) 
    : normalizedPath;
  
  // baseURL already ends with '/', so just append cleanPath
  return `${baseURL}${cleanPath}`;
};

/**
 * Placeholder image URL for books without covers
 */
export const BOOK_PLACEHOLDER = null; // Will trigger placeholder UI in components
