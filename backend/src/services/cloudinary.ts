import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'systum-ott',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload image buffer or base64 to Cloudinary
 */
export const uploadImageToCloudinary = async (
  fileDataOrBase64: string,
  folder = 'systum_ott_products'
): Promise<string> => {
  // If Cloudinary is not configured, return a placeholder or data URI
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_cloudinary_api_key') {
    console.log('ℹ️ Cloudinary credentials not configured yet. Returning input or placeholder.');
    return fileDataOrBase64.startsWith('http') || fileDataOrBase64.startsWith('data:')
      ? fileDataOrBase64
      : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80';
  }

  try {
    const result = await cloudinary.uploader.upload(fileDataOrBase64, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};
