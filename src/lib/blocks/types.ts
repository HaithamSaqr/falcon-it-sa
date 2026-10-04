import type { HeroContent } from "./schemas/hero";
import type { LogoWallContent } from "./schemas/logo_wall";
import type { DepartmentsContent } from "./schemas/departments";
import type { SectorGridContent } from "./schemas/sector_grid";
import type { SetupListContent } from "./schemas/setup_list";
import type { ErpCompareContent } from "./schemas/erp_compare";
import type { ProcessContent } from "./schemas/process";
import type { QuoteContent } from "./schemas/quote";
import type { BookingContent } from "./schemas/booking";
import type { SectorHeroContent } from "./schemas/sector_hero";
import type { LifecycleContent } from "./schemas/lifecycle";
import type { RolePainsContent } from "./schemas/role_pains";
import type { FitContent } from "./schemas/fit";
import type { PlanContent } from "./schemas/plan";
import type { FaqRefContent } from "./schemas/faq_ref";
import type { RichTextContent } from "./schemas/rich_text";
import type { ContactInfoContent } from "./schemas/contact_info";
import type { DemoFormContent } from "./schemas/demo_form";

export type { Bi } from "./bi";
export type { Role } from "./roles";

export const BLOCK_TYPES = [
  "hero",
  "logo_wall",
  "departments",
  "sector_grid",
  "setup_list",
  "erp_compare",
  "process",
  "quote",
  "booking",
  "sector_hero",
  "lifecycle",
  "role_pains",
  "fit",
  "plan",
  "faq_ref",
  "rich_text",
  "contact_info",
  "demo_form",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export function isBlockType(v: string): v is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(v);
}

/** Typed content per block type. */
export interface BlockContentMap {
  hero: HeroContent;
  logo_wall: LogoWallContent;
  departments: DepartmentsContent;
  sector_grid: SectorGridContent;
  setup_list: SetupListContent;
  erp_compare: ErpCompareContent;
  process: ProcessContent;
  quote: QuoteContent;
  booking: BookingContent;
  sector_hero: SectorHeroContent;
  lifecycle: LifecycleContent;
  role_pains: RolePainsContent;
  fit: FitContent;
  plan: PlanContent;
  faq_ref: FaqRefContent;
  rich_text: RichTextContent;
  contact_info: ContactInfoContent;
  demo_form: DemoFormContent;
}

/** A page block row. Discriminated on `type`, so `content` narrows when you check it. */
export type Block<T extends BlockType = BlockType> = {
  [K in T]: {
    id: string;
    page: string;
    type: K;
    sortOrder: number;
    enabled: boolean;
    content: BlockContentMap[K];
  };
}[T];
