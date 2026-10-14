import { readFile, rm, stat, writeFile, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "./uploads";

/**
 * The company profile PDF the admin uploads (Settings > Company Profile).
 * One fixed file in the uploads volume, so it rides along with the images
 * backup and is served at a stable URL, /api/company-profile.
 */
export const PROFILE_FILE = "company-profile.pdf";
export const PROFILE_URL = "/api/company-profile";
export const PROFILE_DOWNLOAD_NAME = "Falcon-Smart-Solutions-Company-Profile.pdf";
export const MAX_PROFILE_BYTES = 25 * 1024 * 1024;

const profilePath = () => path.join(UPLOAD_DIR, PROFILE_FILE);

/** A real PDF starts with "%PDF-"; the file name alone proves nothing. */
export function isPdf(bytes: Uint8Array): boolean {
  return bytes.length > 5 && Buffer.from(bytes.subarray(0, 5)).toString("latin1") === "%PDF-";
}

/** Why an upload is refused, or null when it is a usable profile. */
export function profileUploadError(name: string, bytes: Uint8Array): string | null {
  if (!/\.pdf$/i.test(name)) return "The company profile must be a PDF file";
  if (bytes.length === 0) return "The file is empty";
  if (bytes.length > MAX_PROFILE_BYTES) return "File too large (max 25MB)";
  if (!isPdf(bytes)) return "This file is not a valid PDF";
  return null;
}

export async function getProfileInfo(): Promise<{ size: number; updatedAt: string } | null> {
  try {
    const s = await stat(profilePath());
    return s.isFile() && s.size > 0 ? { size: s.size, updatedAt: s.mtime.toISOString() } : null;
  } catch {
    return null;
  }
}

export async function saveProfile(bytes: Uint8Array): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(profilePath(), bytes);
}

export async function deleteProfile(): Promise<void> {
  await rm(profilePath(), { force: true });
}

export async function readProfile(): Promise<Buffer | null> {
  try {
    return await readFile(profilePath());
  } catch {
    return null;
  }
}
