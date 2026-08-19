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
 * Upload image buffer or base64 to Cloudinary
 */
export const uploadImageToCloudinary = async (
  fileDataOrBase64: string,
  folder = 'systum_ott_products'
): Promise<string> => {
  try {
    initCloudinary();
    const result = await cloudinary.uploader.upload(fileDataOrBase64, {
      folder,
      resource_type: 'auto',
    });
    console.log(`✅ Cloudinary Upload Success: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    // Fallback gracefully so UI never fails
    return fileDataOrBase64.startsWith('http') || fileDataOrBase64.startsWith('data:')
      ? fileDataOrBase64
      : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80';
  }
};
