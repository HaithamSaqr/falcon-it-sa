import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { restoreUploads, type UploadsBackup } from "@/lib/uploads-backup";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// POST /api/admin/uploads/restore — restore images from an uploaded JSON backup
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  let backup: UploadsBackup | null = null;
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return jsonError("No backup file provided", 400);
      backup = JSON.parse(await file.text());
    } else {
      backup = (await request.json()) as UploadsBackup;
    }
  } catch {
    return jsonError("Could not parse the images backup (invalid JSON)", 400);
  }

  if (!backup) return jsonError("Invalid backup", 400);

  try {
    const result = await restoreUploads(backup);
    return jsonSuccess(result, `Restored ${result.files} images`);
  } catch (err) {
    return jsonError("Images restore failed: " + (err instanceof Error ? err.message : "error"), 500);
  }
}
