/**
 * Automatically resizes large images to max ~1200px on the longest side,
 * compresses JPEG/WebP targeting 250KB–350KB max size after compression,
 * and converts to a Base64 Data URL.
 * Rejects with "Image is too large. Please choose a smaller image." if it cannot be safely compressed.
 */
export async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("Please select a valid image file."));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error("Failed to read image file content."));
      }

      const img = new Image();
      img.src = rawDataUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to initialize canvas graphics context."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress starting at JPEG quality 0.82
        let quality = 0.82;
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        // Target length ~470,000 chars (approx 350KB)
        const targetLength = 470000;

        while (compressedDataUrl.length > targetLength && quality > 0.25) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Hard safety cap: ~600,000 base64 chars (~450KB binary) to guarantee Firestore document payload is safe
        if (compressedDataUrl.length > 600000) {
          return reject(new Error("Image is too large. Please choose a smaller image."));
        }

        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error("Failed to process image format."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };
  });
}
