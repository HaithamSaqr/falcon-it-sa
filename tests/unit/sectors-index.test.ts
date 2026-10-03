import { describe, expect, it } from "vitest";
import { sectorsIndexBlocks } from "@/lib/blocks/sectors-index";
import { DEFAULT_SECTORS } from "@/lib/db/defaults";
import { V2_SECTORS, withV2Sectors } from "@/lib/blocks/seed/sectors";
import { parseBlock } from "@/lib/blocks/registry";

const enabled = withV2Sectors(DEFAULT_SECTORS).filter((s) => s.enabled);

function gridOf(blocks: ReturnType<typeof sectorsIndexBlocks>) {
  const g = blocks[0];
  if (g.type !== "sector_grid") throw new Error("expected sector_grid first");
  return g.content;
}

describe("sectorsIndexBlocks", () => {
  it("builds a sector grid and a booking block that both validate", () => {
    const blocks = sectorsIndexBlocks(enabled);
    expect(blocks.map((b) => b.type)).toEqual(["sector_grid", "booking"]);
    for (const b of blocks) expect(parseBlock(b.type, b.content).ok).toBe(true);
  });

  it("makes one card per sector in sort order, with name, promise, photo and href", () => {
    const grid = gridOf(sectorsIndexBlocks([...enabled].reverse()));
    expect(grid.cards.map((c) => c.href)).toEqual(V2_SECTORS.map((s) => `/sectors/${s.slug}`));
    const first = grid.cards[0];
    expect(first.title).toEqual(V2_SECTORS[0].name);
    expect(first.line).toEqual(V2_SECTORS[0].promise);
    expect(first.image).toBe(V2_SECTORS[0].photo);
    expect(first.imageAlt).toEqual(V2_SECTORS[0].photoAlt);
  });

  it("uses the sector name as alt text when the photo was replaced, and no image when there is none", () => {
    const custom = enabled.map((s, i) =>
      i === 0 ? { ...s, photo: "/api/uploads/x.jpg" } : i === 1 ? { ...s, photo: "" } : s,
    );
    const grid = gridOf(sectorsIndexBlocks(custom));
    expect(grid.cards[0].imageAlt).toEqual(custom[0].name);
    expect(grid.cards[1].image).toBe("");
    expect(grid.cards[1].imageAlt).toEqual({ en: "", ar: "" });
  });

  it("has no dash characters in its copy", () => {
    expect(JSON.stringify(sectorsIndexBlocks(enabled))).not.toMatch(/[–—]/);
  });
});
