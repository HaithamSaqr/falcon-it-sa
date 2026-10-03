import type { Block, BlockContentMap, BlockType } from "../types";

/** A seeded block: everything but the database id. */
export type SeedBlock = Omit<Block, "id">;

/** Authoring shape for one seeded block; `content` is checked against its type. */
export type SeedInput = {
  [K in BlockType]: { type: K; enabled?: boolean; content: BlockContentMap[K] };
}[BlockType];

/** Stamp `page` and `sortOrder` (0..n-1) on a page's blocks. `enabled` defaults to true. */
export function seedPage(page: string, items: SeedInput[]): SeedBlock[] {
  return items.map(
    (item, i) =>
      ({
        page,
        type: item.type,
        sortOrder: i,
        enabled: item.enabled ?? true,
        content: item.content,
      }) as SeedBlock,
  );
}
