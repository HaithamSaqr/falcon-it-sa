import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getPool } from "@/lib/db/pool";
import { restoreDatabase, type BackupFile } from "@/lib/db/backup";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// POST /api/admin/connection/restore — restore from an uploaded JSON backup
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  let backup: BackupFile | null = null;
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return jsonError("No backup file provided", 400);
      backup = JSON.parse(await file.text());
    } else {
      backup = (await request.json()) as BackupFile;
    }
  } catch {
    return jsonError("Could not parse the backup file (invalid JSON)", 400);
  }

  if (!backup) return jsonError("Invalid backup", 400);

  try {
    const pool = await getPool();
    const result = await restoreDatabase(pool, backup);
    return jsonSuccess(result, `Restored ${result.rows} rows across ${result.tables} tables`);
  } catch (err) {
    return jsonError("Restore failed: " + (err instanceof Error ? err.message : "error"), 500);
  }
}
