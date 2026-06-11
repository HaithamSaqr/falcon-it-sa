import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export const ALLOWED_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export function extFromName(name: string): string {
  const m = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : "";
}

/** Filenames are uuid + ext; reject anything else to prevent path traversal. */
export function isSafeFilename(name: string): boolean {
  return /^[a-z0-9-]+\.[a-z0-9]+$/i.test(name);
}
