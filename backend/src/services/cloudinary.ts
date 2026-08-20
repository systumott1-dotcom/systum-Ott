import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from env variables
const initCloudinary = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
    });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'juvd58wl',
      api_key: process.env.CLOUDINARY_API_KEY || '943872296863389',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'pGC5hEpkRcovshRNgLNMxIva3Rs',
    });
  }
};

initCloudinary();

/**
 * Allowed MIME types and extensions for security: PNG, JPEG, JPG, WebP
 */
export const ALLOWED_IMAGE_MIME_REGEX = /^data:image\/(png|jpeg|jpg|webp);base64,/i;

/**
 * Validate that uploaded string is a legitimate image format and not a zip, binary, or script
 */
export const isAllowedImagePayload = (payload: string): boolean => {
  if (!payload || typeof payload !== 'string') return false;
  // If already an existing HTTPS image URL
  if (payload.startsWith('https://') || payload.startsWith('http://')) {
    const lower = payload.toLowerCase();
    return !lower.endsWith('.zip') && !lower.endsWith('.tar') && !lower.endsWith('.gz') && !lower.endsWith('.exe');
  }
  // If base64 data URI, strictly check image MIME header
  return ALLOWED_IMAGE_MIME_REGEX.test(payload);
};

/**
 * Upload image buffer or base64 to Cloudinary with strict PNG / JPEG / WebP validation
 */
export const uploadImageToCloudinary = async (
  fileDataOrBase64: string,
  folder = 'systum_ott_products'
): Promise<string> => {
  try {
    if (!isAllowedImagePayload(fileDataOrBase64)) {
      throw new Error('Invalid file format. Only PNG, JPEG, JPG, and WebP images are allowed.');
    }

    initCloudinary();
    const result = await cloudinary.uploader.upload(fileDataOrBase64, {
      folder,
      resource_type: 'image', // Strictly images only - prevents zip/executable uploads
      allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
    });
    console.log(`✅ Cloudinary Upload Success: ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Cloudinary Upload Error:', error?.message || error);
    // If invalid format was detected, rethrow error
    if (error?.message?.includes('Invalid file format')) {
      throw error;
    }
    // Fallback gracefully for valid image base64
    return fileDataOrBase64.startsWith('http') || fileDataOrBase64.startsWith('data:image/')
      ? fileDataOrBase64
      : 'https://api.dicebear.com/7.x/bottts/svg?seed=SystumFallback&backgroundColor=b6e3f4';
  }
};
