import { Fragment, type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Bi } from "@/lib/blocks/bi";
import type { Block, BlockType } from "@/lib/blocks/types";
import { getClients } from "@/lib/data-store";
import { getPublicSettings } from "@/lib/public-settings";
import { safeDemoUrl } from "@/lib/blocks/cta";
import { V2_CLIENT_LOGOS } from "@/lib/blocks/seed/clients";
import type { SectionTone } from "@/components/v2/ui/section";
import { RoleProvider } from "@/components/v2/islands/role-provider";
import type { BlockLabels, Placement, RenderContext } from "./context";
import HeroBlock from "./hero";
import LogoWallBlock from "./logo-wall";
import DepartmentsBlock from "./departments";
import SectorGridBlock from "./sector-grid";
import SetupListBlock from "./setup-list";
import ErpCompareBlock from "./erp-compare";
import ProcessBlock from "./process";
import QuoteBlock from "./quote";
import BookingBlock from "./booking";
import SectorHeroBlock from "./sector-hero";
import LifecycleBlock from "./lifecycle";
import RolePainsBlock from "./role-pains";
import FitBlock from "./fit";
import PlanBlock from "./plan";
import FaqRefBlock from "./faq-ref";
import RichTextBlock from "./rich-text";
import ContactInfoBlock from "./contact-info";
import DemoFormBlock from "./demo-form";

export type { RenderContext } from "./context";

/** Section anchor per block type, so seeded links (`/#how`, `#cycle`) resolve. */
export const BLOCK_ANCHORS: Partial<Record<BlockType, string>> = {
  logo_wall: "clients",
  departments: "erp",
  sector_grid: "sectors",
  erp_compare: "systems",
  process: "how",
  lifecycle: "cycle",
  role_pains: "pains",
  fit: "fit",
  plan: "plan",
  faq_ref: "faq",
  booking: "book",
};

const HERO_TYPES = new Set<BlockType>(["hero", "sector_hero"]);
const ROLE_TYPES = new Set<BlockType>(["sector_hero", "lifecycle", "role_pains"]);

export type BlockRendererContext = {
  /** "Book a demo" target; read from site settings when omitted. */
  demoUrl?: string;
  /** Sector pages: the sector (slug in `id`) for the breadcrumb and `?sector=` links. */
  sector?: { id: string; name: Bi };
  /** `?role=` from the URL: the starting role when it is declared. */
  roleParam?: string;
  /** The demo booking form, shown inside a `demo_form` block. */
  demoForm?: ReactNode;
  /** The contact form, shown beside the details of a `contact_info` block. */
  contactForm?: ReactNode;
};

type BlockRendererProps = {
  blocks: Block[];
  locale: string;
  context?: BlockRendererContext;
};

/**
 * Lays out the band tones: heroes (and a logo strip right under one) sit on
 * the page tone, the booking block is the brand band, and every other block
 * alternates white and page tone, starting white. A first block that is not
 * a hero acts as the page header: page tone, and its heading is the H1.
 */
export function placeBlocks(blocks: Pick<Block, "type">[]): Placement[] {
  const used = new Set<string>();
  let next: SectionTone = "surface";
  let switcherShown = false;
  return blocks.map((b, i) => {
    const prev = blocks[i - 1]?.type;
    const afterHero = prev !== undefined && HERO_TYPES.has(prev);
    let tone: SectionTone;
    if (HERO_TYPES.has(b.type) || (b.type === "logo_wall" && afterHero)) {
      tone = "page";
    } else if (b.type === "booking") {
      tone = "brand";
    } else if (i === 0) {
      tone = "page";
      next = "surface";
    } else {
      tone = next;
      next = next === "surface" ? "page" : "surface";
    }
    const anchor = BLOCK_ANCHORS[b.type];
    const id = anchor && !used.has(anchor) ? anchor : undefined;
    if (id) used.add(id);
    const ownRoleSwitcher = ROLE_TYPES.has(b.type) && b.type !== "sector_hero" && !switcherShown;
    if (ROLE_TYPES.has(b.type)) switcherShown = true;
    return { id, tone, first: i === 0, afterHero, ownRoleSwitcher };
  });
}

function renderBlock(block: Block, ctx: RenderContext, place: Placement): ReactNode {
  switch (block.type) {
    case "hero":
      return <HeroBlock content={block.content} ctx={ctx} place={place} />;
    case "logo_wall":
      return <LogoWallBlock content={block.content} ctx={ctx} place={place} />;
    case "departments":
      return <DepartmentsBlock content={block.content} ctx={ctx} place={place} />;
    case "sector_grid":
      return <SectorGridBlock content={block.content} ctx={ctx} place={place} />;
    case "setup_list":
      return <SetupListBlock content={block.content} ctx={ctx} place={place} />;
    case "erp_compare":
      return <ErpCompareBlock content={block.content} ctx={ctx} place={place} />;
    case "process":
      return <ProcessBlock content={block.content} ctx={ctx} place={place} />;
    case "quote":
      return <QuoteBlock content={block.content} ctx={ctx} place={place} />;
    case "booking":
      return <BookingBlock content={block.content} ctx={ctx} place={place} />;
    case "sector_hero":
      return <SectorHeroBlock content={block.content} ctx={ctx} place={place} />;
    case "lifecycle":
      return <LifecycleBlock content={block.content} ctx={ctx} place={place} />;
    case "role_pains":
      return <RolePainsBlock content={block.content} ctx={ctx} place={place} />;
    case "fit":
      return <FitBlock content={block.content} ctx={ctx} place={place} />;
    case "plan":
      return <PlanBlock content={block.content} ctx={ctx} place={place} />;
    case "faq_ref":
      return <FaqRefBlock content={block.content} ctx={ctx} place={place} />;
    case "rich_text":
      return <RichTextBlock content={block.content} ctx={ctx} place={place} />;
    case "contact_info":
      return <ContactInfoBlock content={block.content} ctx={ctx} place={place} />;
    case "demo_form":
      return <DemoFormBlock content={block.content} ctx={ctx} place={place} />;
    default:
      return null;
  }
}

async function loadClients(): Promise<{ name: string; logo: string }[]> {
  const rows = await getClients().catch(() => []);
  const clients = rows
    .filter((c) => (c.logo ?? "").trim() !== "")
    .map((c) => ({ name: c.name.en || c.name.ar || "", logo: c.logo }));
  return clients.length > 0 ? clients : V2_CLIENT_LOGOS;
}

/**
 * Renders a page's blocks in order (server component). Blocks it receives are
 * rendered as given; `getPageBlocks` already drops disabled ones. Role-aware
 * blocks (sector hero, lifecycle, pains) share one RoleProvider.
 */
export default async function BlockRenderer({ blocks, locale, context = {} }: BlockRendererProps) {
  const lang = locale === "ar" ? "ar" : "en";
  const needsSettings = !context.demoUrl || blocks.some((b) => b.type === "contact_info");
  const settings = needsSettings ? await getPublicSettings() : undefined;
  const clients = blocks.some((b) => b.type === "logo_wall") ? await loadClients() : [];

  const t = await getTranslations({ locale: lang, namespace: "blocks" });
  const chrome = await getTranslations({ locale: lang, namespace: "chrome" });
  const labels: BlockLabels = {
    seeModules: t("seeModules"),
    seeSetup: t("seeSetup"),
    modulesAlt: t("modulesAlt"),
    appsAlt: t("appsAlt"),
    breadcrumb: t("breadcrumb"),
    sectors: chrome("sectors"),
    quoteRole: t.raw("quoteRole") as string,
    phone: t("phone"),
    whatsapp: t("whatsapp"),
    email: t("email"),
    address: t("address"),
    branches: t("branches"),
    social: t("social"),
    yourRole: t("yourRole"),
  };

  const places = placeBlocks(blocks);
  const roleBlock = blocks.find((b) => ROLE_TYPES.has(b.type)) as Block<"sector_hero" | "lifecycle" | "role_pains"> | undefined;
  const roleIds = roleBlock ? roleBlock.content.roles.map((r) => r.id) : [];

  const ctx: RenderContext = {
    locale: lang,
    // Settings come from the database: only a path or https URL is used.
    demoUrl: safeDemoUrl(context.demoUrl || settings?.primaryCta.demoUrl),
    sector: context.sector ? { id: context.sector.id, name: context.sector.name } : undefined,
    roleAware: roleIds.length > 0,
    clients,
    settings,
    anchors: places.map((p) => p.id).filter((id): id is string => Boolean(id)),
    demoForm: context.demoForm,
    contactForm: context.contactForm,
    labels,
  };

  const rendered = blocks.map((block, i) => (
    <Fragment key={block.id || `${block.type}-${i}`}>{renderBlock(block, ctx, places[i])}</Fragment>
  ));

  if (roleIds.length === 0) return <>{rendered}</>;
  return (
    <RoleProvider roles={roleIds} initial={context.roleParam}>
      {rendered}
    </RoleProvider>
  );
}
