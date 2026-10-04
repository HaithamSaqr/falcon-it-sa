import type { ReactNode } from "react";
import type { Bi } from "@/lib/blocks/bi";
import type { BlockContentMap, BlockType } from "@/lib/blocks/types";
import type { PublicSettings } from "@/lib/public-chrome";
import type { SectionTone } from "@/components/v2/ui/section";

/** UI strings for the blocks (messages `blocks.*`), resolved once per render. */
export type BlockLabels = {
  seeModules: string;
  seeSetup: string;
  modulesAlt: string;
  appsAlt: string;
  breadcrumb: string;
  sectors: string;
  quoteRole: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  branches: string;
  social: string;
  yourRole: string;
};

export type Locale = "en" | "ar";

/** Everything a block needs besides its own content. */
export type RenderContext = {
  locale: Locale;
  /** Global "Book a demo" target (site_settings.demo_url). */
  demoUrl: string;
  /** Sector pages: slug and name (breadcrumb, `?sector=` on CTAs). */
  sector?: { id: string; name: Bi };
  /** True when a RoleProvider wraps the page. */
  roleAware: boolean;
  /** Client logos for `logo_wall`. */
  clients: { name: string; logo: string }[];
  /** Site settings for `contact_info`. */
  settings?: PublicSettings;
  /** Section anchors present on this page (e.g. "erp" when a departments block exists). */
  anchors: string[];
  /** The demo booking form, rendered inside `demo_form`. */
  demoForm?: ReactNode;
  /** The contact form, rendered beside the details in `contact_info`. */
  contactForm?: ReactNode;
  labels: BlockLabels;
};

/** Where a block sits on the page. */
export type Placement = {
  /** Anchor id from the block type default (first block of a type only). */
  id?: string;
  tone: SectionTone;
  /** First block on the page: its heading is the page H1. */
  first: boolean;
  /** Directly after a hero (the logo strip tucks under it). */
  afterHero: boolean;
  /** No role switcher earlier on the page, so this block shows its own. */
  ownRoleSwitcher: boolean;
};

export type BlockProps<K extends BlockType> = {
  content: BlockContentMap[K];
  ctx: RenderContext;
  place: Placement;
};

/** Attributes every block root carries (anchor and the type marker tests and analytics use). */
export function rootProps(type: BlockType, place: Placement) {
  return { id: place.id, "data-block-type": type } as const;
}
