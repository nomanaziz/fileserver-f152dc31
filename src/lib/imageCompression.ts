/**
 * Client-side image compression using Canvas API.
 * Resizes to maxWidth and converts to WebP (JPEG fallback).
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, w, h);

      // Try WebP first, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) return resolve(blob);
          // Fallback to JPEG
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error("Image compression failed"));
            },
            "image/jpeg",
            quality
          );
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
