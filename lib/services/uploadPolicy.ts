export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// SVG is intentionally excluded: it can carry executable script.
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

export const IMAGE_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function isAllowedImageUpload(mimeType: string, extension: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.has(mimeType) && ALLOWED_IMAGE_EXTENSIONS.has(extension);
}
