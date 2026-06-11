import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR, ALLOWED_EXT, extFromName, isSafeFilename } from "@/lib/uploads";

// GET /api/uploads/[file] — serve an uploaded image from the data volume
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!isSafeFilename(file)) return new Response("Not found", { status: 404 });

  const ext = extFromName(file);
  const contentType = ALLOWED_EXT[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
