import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_DIR, isSafeFilename } from "./uploads";

/** Portable images backup — base64 files in JSON (no external tools, works in Docker). */
export interface UploadsBackup {
  app: "falcon-uploads";
  version: number;
  createdAt: string;
  files: { name: string; data: string }[]; // data = base64
}

export async function dumpUploads(): Promise<UploadsBackup> {
  let names: string[] = [];
  try {
    names = await readdir(UPLOAD_DIR);
  } catch {
    names = []; // directory may not exist yet
  }

  const files: { name: string; data: string }[] = [];
  for (const name of names) {
    if (!isSafeFilename(name)) continue;
    try {
      const buf = await readFile(path.join(UPLOAD_DIR, name));
      files.push({ name, data: buf.toString("base64") });
    } catch {
      /* skip unreadable files */
    }
  }

  return { app: "falcon-uploads", version: 1, createdAt: new Date().toISOString(), files };
}

export async function restoreUploads(backup: UploadsBackup): Promise<{ files: number }> {
  if (!backup || backup.app !== "falcon-uploads" || !Array.isArray(backup.files)) {
    throw new Error("Invalid images backup file");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  let count = 0;
  for (const f of backup.files) {
    // Safe filenames only (prevents path traversal); skip anything malformed.
    if (!f?.name || !isSafeFilename(f.name) || typeof f.data !== "string") continue;
    await writeFile(path.join(UPLOAD_DIR, f.name), Buffer.from(f.data, "base64"));
    count++;
  }
  return { files: count };
}
