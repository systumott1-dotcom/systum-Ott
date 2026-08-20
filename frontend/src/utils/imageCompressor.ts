/**
 * High-performance browser-based image compression utility.
 * Resizes large images (e.g. 5MB-15MB phone camera/desktop screenshots)
 * down to ~80KB-200KB WebP/JPEG while preserving text and UI sharpness.
 */

export interface CompressionResult {
  base64: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(fileOrBlob.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio keeping dimensions inside maxWidth/maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          // Fallback to raw base64 if canvas context fails
          const rawBase64 = readerEvent.target?.result as string;
          resolve({
            base64: rawBase64,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // Enable high quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // White background in case of transparent pngs converted to jpeg
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw image resized
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with optimized quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        // Approximate size of base64 in KB: (base64.length * 3/4) / 1024
        const compressedSizeKb = Math.round((compressedBase64.length * 3) / 4 / 1024);

        resolve({
          base64: compressedBase64,
          originalSizeKb,
          compressedSizeKb,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Extracts image file from clipboard paste event
 */
export function getImageFromPasteEvent(e: React.ClipboardEvent | ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
