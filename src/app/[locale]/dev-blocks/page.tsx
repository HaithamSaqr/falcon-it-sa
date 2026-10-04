import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import BlockRenderer from "@/components/v2/blocks";
import { BLOCK_TYPES, type Block } from "@/lib/blocks/types";
import { SEED } from "@/lib/blocks/seed";
import { getPublicSettings } from "@/lib/public-settings";
import { V2_SECTORS } from "@/lib/blocks/seed/sectors";
import { validFixtures } from "@/lib/blocks/fixtures";
import { EDGE_BLANK_AR, EDGE_HERO_ROLES, EDGE_LONG, EDGE_ROLES } from "./fixtures";

/**
 * Dev-only gallery of every block (Task 7): the populated fixtures, edge
 * cases, and every SEED page, each in its own renderer (own role state).
 * 404 in production, never indexed, not in the sitemap.
 */
export const metadata: Metadata = {
  title: "Blocks (dev)",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  /** `?group=home,sector:real-estate` renders only those groups (faster tests). */
  searchParams: Promise<{ group?: string | string[] }>;
};

const FIXTURES: Block[] = BLOCK_TYPES.map(
  (type, i) =>
    ({ id: `fx-${type}`, page: "fixtures", type, sortOrder: i, enabled: true, content: validFixtures[type] }) as Block,
);

export default async function DevBlocksPage({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  const only = [(await searchParams).group ?? []].flat().flatMap((g) => g.split(",")).filter(Boolean);
  setRequestLocale(locale);
  const demoUrl = (await getPublicSettings()).primaryCta.demoUrl;

  const groups: { key: string; blocks: Block[]; sector?: { id: string; name: { en: string; ar: string } } }[] = [
    ...Object.entries(SEED).map(([key, seed]) => {
      const slug = key.startsWith("sector:") ? key.slice("sector:".length) : "";
      const sector = V2_SECTORS.find((s) => s.slug === slug);
      return {
        key,
        blocks: seed.map((b, i) => ({ ...b, id: `${key}-${i}` }) as Block),
        sector: sector ? { id: sector.slug, name: sector.name } : undefined,
      };
    }),
    { key: "fixtures", blocks: FIXTURES },
    { key: "edge-long", blocks: EDGE_LONG },
    { key: "edge-blank-ar", blocks: EDGE_BLANK_AR },
    { key: "edge-roles", blocks: EDGE_ROLES },
    { key: "edge-hero-roles", blocks: EDGE_HERO_ROLES },
  ];

  const shown = only.length > 0 ? groups.filter((g) => only.includes(g.key)) : groups;

  return (
    <div className="bg-page">
      {shown.map((g) => (
        <div key={g.key} data-page={g.key}>
          <p className="sticky top-0 z-40 bg-ink px-5 py-1.5 font-mono text-xs text-white" dir="ltr">
            {g.key}
          </p>
          <BlockRenderer blocks={g.blocks} locale={locale} context={{ demoUrl, sector: g.sector }} />
        </div>
      ))}
    </div>
  );
}
