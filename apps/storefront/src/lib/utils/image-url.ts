import { Product } from "@/types";
import { PLACEHOLDER_IMAGE } from "../constants";

/**
 * Get full image URL from file path
 * @param {string} filePath - The file path from Medusa (e.g., /upload/product/abc.jpg)
 * @param {string} baseUrl - Optional base URL (defaults to NEXT_PUBLIC_STORE_URL)
 * @returns {string} Full image URL
 */
export const getFullImageUrl = (filePath: string, baseUrl = null) => {
  if (!filePath) return PLACEHOLDER_IMAGE; // Return placeholder if no file path
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Get base URL from environment or parameter
  const base = baseUrl || process.env.NEXT_PUBLIC_IMAGE_HOST_ADDRESS || '';
  
  // Ensure path starts with /
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${base}${path}`;
};

/**
 * Get thumbnail URL (for product listings)
 */
export const getThumbnailUrl = (product: Product, size = 'small') => {
    const thumbnail = product.images[0]
  if (!thumbnail) return '/placeholder.jpg';
  
  // You can add image processing parameters here if needed
  return getFullImageUrl(thumbnail.url);
};

/**
 * Get gallery image URLs
 */
export const getGalleryUrls = (product: Product) => {
  if (!product.images || product.images.length === 0) {
    return [];
  }
  
  return product.images.map(img => getFullImageUrl(img.url));
};
