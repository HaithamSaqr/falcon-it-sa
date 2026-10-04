import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { BlockValidationError, getPageBlocksAdmin, savePageBlocks } from "@/lib/blocks/store";
import type { Block } from "@/lib/blocks/types";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { decodePageKey } from "@/lib/admin/page-keys";

type Ctx = { params: Promise<{ page: string }> };

// GET /api/admin/pages/[page]: every block of the page (enabled or not), in order.
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const page = decodePageKey((await params).page);
  if (!page) return jsonError("page: invalid page key", 400);
  try {
    return jsonSuccess(await getPageBlocksAdmin(page));
  } catch (err) {
    console.error(`[admin/pages] load "${page}" failed:`, err);
    return jsonError("Could not load the page. Check the database connection.", 500);
  }
}

// PUT /api/admin/pages/[page]  body { blocks: Block[] }
// 400 { error: "<path>: <message>" } on the first invalid block (nothing is written).
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const page = decodePageKey((await params).page);
  if (!page) return jsonError("page: invalid page key", 400);

  const body = (await request.json().catch(() => null)) as { blocks?: unknown } | null;
  if (!body || typeof body !== "object" || !Array.isArray(body.blocks)) {
    return jsonError("blocks: expected a list of blocks", 400);
  }

  try {
    await savePageBlocks(page, body.blocks as Block[]);
    return jsonSuccess(await getPageBlocksAdmin(page), "Page saved");
  } catch (err) {
    if (err instanceof BlockValidationError) return jsonError(err.message, 400);
    console.error(`[admin/pages] save "${page}" failed:`, err);
    return jsonError("Could not save the page. Nothing was changed.", 500);
  }
}
