export async function compressImageFile(
  file: File,
  maxDimension = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const srcResult = e.target?.result as string;
      if (!srcResult) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
            if (isPng) {
              // Ensure transparent background for PNG
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/png');
              if (compressed && compressed.startsWith('data:image/')) {
                resolve(compressed);
                return;
              }
            } else {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', quality);
              if (compressed && compressed.startsWith('data:image/')) {
                resolve(compressed);
                return;
              }
            }
          }
          resolve(srcResult);
        } catch (err) {
          resolve(srcResult);
        }
      };
      img.onerror = () => resolve(srcResult);
      img.src = srcResult;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function optimizeImageUrl(url: string | undefined): string {
  if (!url) return '';
  return url;
}
