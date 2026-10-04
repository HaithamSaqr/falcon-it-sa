import { notFound } from "next/navigation";
import { getPageBlocks } from "@/lib/blocks/store";
import { pickBi } from "@/lib/blocks/bi";
import { SEED } from "@/lib/blocks/seed";
import { PAGE_META, type PageKey } from "@/lib/page-meta";
import type { Block, BlockType } from "@/lib/blocks/types";
import PageBlocks from "./page-blocks";
import type { BlockRendererContext } from "./blocks";

type Props = {
  /** CMS page key, also the `PAGE_META` key (breadcrumb name and path). */
  page: PageKey;
  locale: string;
  /** Blocks to render instead of the stored ones (pages without a CMS seed). */
  blocks?: Block[];
  context?: BlockRendererContext;
};

/**
 * A page's stored blocks, always including one of `type`: a page whose form
 * lives in that block (demo, contact) keeps its form even if the admin removed
 * or disabled the frame; the seeded frame then stands in, first on the page.
 */
export async function blocksWith(page: PageKey, type: BlockType): Promise<Block[]> {
  const stored = await getPageBlocks(page);
  if (stored.some((b) => b.type === type)) return stored;
  const seed = (SEED[page] ?? []).find((b) => b.type === type);
  return seed ? [{ ...structuredClone(seed), id: `seed:${page}:${type}` } as Block, ...stored] : stored;
}

/**
 * A standalone page built from CMS blocks (about, contact, demo, faq, terms,
 * privacy policy, clients): breadcrumb JSON-LD and the blocks. A page the
 * admin emptied has nothing to show, so it is a 404.
 */
export default async function BlockPage({ page, locale, blocks, context }: Props) {
  const lang = locale === "ar" ? "ar" : "en";
  const list = blocks ?? (await getPageBlocks(page));
  if (list.length === 0) notFound();
  const meta = PAGE_META[page];
  return (
    <PageBlocks
      blocks={list}
      locale={locale}
      crumbs={[{ name: pickBi(meta.title, lang), path: meta.path }]}
      context={context}
    />
  );
}
