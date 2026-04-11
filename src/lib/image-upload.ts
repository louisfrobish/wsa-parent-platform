export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const CLIENT_RESIZE_TARGET_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 1600;

export function isSupportedImageType(type: string) {
  return SUPPORTED_IMAGE_TYPES.includes(type as (typeof SUPPORTED_IMAGE_TYPES)[number]);
}

export function getImageUploadError(file: File) {
  if (!isSupportedImageType(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "That image is still too large. Try a smaller photo.";
  }

  return null;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be opened."));
    };

    image.src = objectUrl;
  });
}

export async function prepareImageUpload(file: File) {
  const unsupportedError = !isSupportedImageType(file.type) ? "Use a JPG, PNG, WEBP, or GIF image." : null;
  if (unsupportedError) {
    return { file: null, message: unsupportedError, wasCompressed: false };
  }

  const needsResize = file.size > CLIENT_RESIZE_TARGET_BYTES;
  if (!needsResize) {
    return { file, message: "", wasCompressed: false };
  }

  try {
    const image = await loadImageFromFile(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return { file, message: "", wasCompressed: false };
    }

    context.drawImage(image, 0, 0, width, height);
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.82));

    if (!blob) {
      return { file, message: "", wasCompressed: false };
    }

    const resizedFile = new File([blob], file.name.replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".jpg"), {
      type: outputType
    });

    const finalError = getImageUploadError(resizedFile);
    if (finalError) {
      return { file: null, message: finalError, wasCompressed: true };
    }

    return {
      file: resizedFile,
      message: "Large photo resized for faster upload.",
      wasCompressed: true
    };
  } catch {
    return { file, message: "", wasCompressed: false };
  }
}
