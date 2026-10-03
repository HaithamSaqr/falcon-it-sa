import type { ZodType } from "zod";
import type { Bi } from "./bi";
import { isBlockType, type Block, type BlockType } from "./types";
import { heroSchema, heroDefaults } from "./schemas/hero";
import { logoWallSchema, logoWallDefaults } from "./schemas/logo_wall";
import { departmentsSchema, departmentsDefaults } from "./schemas/departments";
import { sectorGridSchema, sectorGridDefaults } from "./schemas/sector_grid";
import { setupListSchema, setupListDefaults } from "./schemas/setup_list";
import { erpCompareSchema, erpCompareDefaults } from "./schemas/erp_compare";
import { processSchema, processDefaults } from "./schemas/process";
import { quoteSchema, quoteDefaults } from "./schemas/quote";
import { bookingSchema, bookingDefaults } from "./schemas/booking";
import { sectorHeroSchema, sectorHeroDefaults } from "./schemas/sector_hero";
import { lifecycleSchema, lifecycleDefaults } from "./schemas/lifecycle";
import { rolePainsSchema, rolePainsDefaults } from "./schemas/role_pains";
import { fitSchema, fitDefaults } from "./schemas/fit";
import { planSchema, planDefaults } from "./schemas/plan";
import { faqRefSchema, faqRefDefaults } from "./schemas/faq_ref";
import { richTextSchema, richTextDefaults } from "./schemas/rich_text";
import { contactInfoSchema, contactInfoDefaults } from "./schemas/contact_info";
import { demoFormSchema, demoFormDefaults } from "./schemas/demo_form";

export type BlockDefinition = {
  schema: ZodType;
  label: Bi;
  /** Returns a fresh, valid content object every call. */
  defaults: () => unknown;
};

export const BLOCKS: Record<BlockType, BlockDefinition> = {
  hero: { schema: heroSchema, label: { en: "Hero", ar: "الواجهة الرئيسية" }, defaults: heroDefaults },
  logo_wall: { schema: logoWallSchema, label: { en: "Client logos", ar: "شعارات العملاء" }, defaults: logoWallDefaults },
  departments: { schema: departmentsSchema, label: { en: "Departments", ar: "الأقسام" }, defaults: departmentsDefaults },
  sector_grid: { schema: sectorGridSchema, label: { en: "Sector grid", ar: "شبكة القطاعات" }, defaults: sectorGridDefaults },
  setup_list: { schema: setupListSchema, label: { en: "Setup points", ar: "نقاط الإعداد" }, defaults: setupListDefaults },
  erp_compare: { schema: erpCompareSchema, label: { en: "Odoo vs Falcon ERP", ar: "أودو مقابل فالكون ERP" }, defaults: erpCompareDefaults },
  process: { schema: processSchema, label: { en: "Process", ar: "مراحل العمل" }, defaults: processDefaults },
  quote: { schema: quoteSchema, label: { en: "Client quote", ar: "شهادة عميل" }, defaults: quoteDefaults },
  booking: { schema: bookingSchema, label: { en: "Booking block", ar: "قسم الحجز" }, defaults: bookingDefaults },
  sector_hero: { schema: sectorHeroSchema, label: { en: "Sector hero", ar: "واجهة القطاع" }, defaults: sectorHeroDefaults },
  lifecycle: { schema: lifecycleSchema, label: { en: "Lifecycle by role", ar: "الدورة حسب الدور" }, defaults: lifecycleDefaults },
  role_pains: { schema: rolePainsSchema, label: { en: "Pains by role", ar: "المشكلات حسب الدور" }, defaults: rolePainsDefaults },
  fit: { schema: fitSchema, label: { en: "Odoo or Falcon fit", ar: "أودو أم فالكون" }, defaults: fitDefaults },
  plan: { schema: planSchema, label: { en: "Plan", ar: "الخطة" }, defaults: planDefaults },
  faq_ref: { schema: faqRefSchema, label: { en: "Page FAQ", ar: "أسئلة الصفحة" }, defaults: faqRefDefaults },
  rich_text: { schema: richTextSchema, label: { en: "Text", ar: "نص" }, defaults: richTextDefaults },
  contact_info: { schema: contactInfoSchema, label: { en: "Contact details", ar: "بيانات التواصل" }, defaults: contactInfoDefaults },
  demo_form: { schema: demoFormSchema, label: { en: "Demo form", ar: "نموذج العرض التجريبي" }, defaults: demoFormDefaults },
};

export type ParseBlockMeta = Partial<Pick<Block, "id" | "page" | "sortOrder" | "enabled">>;

export type ParseBlockResult = { ok: true; block: Block } | { ok: false; error: string };

/**
 * Validate content for a block type. On success returns a Block; `id`, `page`,
 * `sortOrder` and `enabled` come from `meta` (placeholders "", "", 0, true otherwise).
 * On failure `error` is "<path>: <message>" for the first Zod issue.
 */
export function parseBlock(type: string, content: unknown, meta: ParseBlockMeta = {}): ParseBlockResult {
  if (!isBlockType(type)) return { ok: false, error: `type: unknown block type "${type}"` };
  const result = BLOCKS[type].schema.safeParse(content);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.map(String).join(".");
    return { ok: false, error: `${path || "(content)"}: ${issue.message}` };
  }
  const block = {
    id: meta.id ?? "",
    page: meta.page ?? "",
    type,
    sortOrder: meta.sortOrder ?? 0,
    enabled: meta.enabled ?? true,
    content: result.data,
  } as Block;
  return { ok: true, block };
}
