const MAX_IMAGE_WIDTH = 1200;
const JPEG_QUALITY = 0.8;
const AVATAR_SIZE = 200;
const AVATAR_QUALITY = 0.85;

export async function compressDataURL(dataURL: string, maxWidth = MAX_IMAGE_WIDTH): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

function getOptimizedImageUrl(
  url: string,
  options: { width?: number; quality?: number } = {}
): string {
  const { width = 400, quality = 75 } = options;

  if (!url || !url.includes('supabase')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&quality=${quality}`;
}

export function getThumbnailUrl(url: string): string {
  return getOptimizedImageUrl(url, { width: 400, quality: 75 });
}

export function getPreviewUrl(url: string): string {
  return getOptimizedImageUrl(url, { width: 200, quality: 70 });
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function compressAvatar(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const minDimension = Math.min(width, height);
      const sx = (width - minDimension) / 2;
      const sy = (height - minDimension) / 2;

      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;

      ctx?.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress avatar'));
          }
        },
        'image/jpeg',
        AVATAR_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function getAvatarUrl(url: string | null | undefined, size = 80): string {
  if (!url) return '';
  if (!url.includes('supabase')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${size}&height=${size}&quality=80`;
}
