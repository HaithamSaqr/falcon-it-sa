/**
 * Rejection cases for every block type; the valid fixtures live in src/lib/blocks/fixtures.ts.
 * Typed against BlockContentMap so a schema change breaks compilation here.
 * Reused by later tasks (seed tests, renderer tests).
 */
import type { BlockType } from "@/lib/blocks/types";
import { validFixtures } from "@/lib/blocks/fixtures";

export { validFixtures };

const bi = (en: string, ar = "") => ({ en, ar });

export type Rejection = {
  type: BlockType;
  name: string;
  /** Builds invalid content from a deep clone of the valid fixture. */
  make: (valid: any) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Substring expected in the parseBlock error (the issue path). */
  path: string;
};

export const rejections: Rejection[] = [
  { type: "hero", name: "pill link is javascript:", make: (v) => ((v.sectorPills[0].href = "javascript:alert(1)"), v), path: "sectorPills.0.href" },
  { type: "hero", name: "blank primary CTA label", make: (v) => ((v.primaryCta.label = bi("", "")), v), path: "primaryCta.label" },
  { type: "hero", name: "too many pills", make: (v) => ((v.sectorPills = Array.from({ length: 13 }, () => v.sectorPills[0])), v), path: "sectorPills" },
  { type: "logo_wall", name: "limit above 60", make: (v) => ((v.limit = 61), v), path: "limit" },
  { type: "logo_wall", name: "limit is not an integer", make: (v) => ((v.limit = 2.5), v), path: "limit" },
  { type: "logo_wall", name: "link with label but bad href", make: (v) => ((v.link.href = "http://insecure.example"), v), path: "link.href" },
  { type: "departments", name: "icon is not an identifier", make: (v) => ((v.items[0].icon = "two words"), v), path: "items.0.icon" },
  { type: "departments", name: "item title blank", make: (v) => ((v.items[1].title = bi("", "")), v), path: "items.1.title" },
  { type: "sector_grid", name: "card href is not a link", make: (v) => ((v.cards[0].href = "real-estate"), v), path: "cards.0.href" },
  { type: "sector_grid", name: "card image outside allowed prefixes", make: (v) => ((v.cards[0].image = "/etc/passwd"), v), path: "cards.0.image" },
  { type: "sector_grid", name: "other card CTA label blank", make: (v) => ((v.otherCard.ctaLabel = bi("", "")), v), path: "otherCard.ctaLabel" },
  { type: "setup_list", name: "problem blank", make: (v) => ((v.points[0].problem = bi("", "")), v), path: "points.0.problem" },
  { type: "setup_list", name: "link label without href", make: (v) => ((v.link.href = ""), v), path: "link.href" },
  { type: "erp_compare", name: "falcon link is javascript:", make: (v) => ((v.falcon.link.href = "javascript:void(0)"), v), path: "falcon.link.href" },
  { type: "erp_compare", name: "odoo card missing title", make: (v) => (delete v.odoo.title, v), path: "odoo.title" },
  { type: "erp_compare", name: "chip longer than 2000", make: (v) => ((v.odoo.chips[0] = bi("x".repeat(2001))), v), path: "odoo.chips.0.en" },
  { type: "process", name: "step has no duration field", make: (v) => (delete v.steps[0].duration, v), path: "steps.0.duration" },
  { type: "process", name: "more than 10 steps", make: (v) => ((v.steps = Array.from({ length: 11 }, () => v.steps[0])), v), path: "steps" },
  { type: "quote", name: "quote text blank", make: (v) => ((v.text = bi("", "")), v), path: "text" },
  { type: "quote", name: "logo is a data URI", make: (v) => ((v.logo = "data:image/png;base64,AAAA"), v), path: "logo" },
  { type: "booking", name: "CTA href is javascript:", make: (v) => ((v.cta.href = "javascript:alert(1)"), v), path: "cta.href" },
  { type: "booking", name: "CTA label blank", make: (v) => ((v.cta.label = bi("", "")), v), path: "cta.label" },
  { type: "sector_hero", name: "promise missing for declared role", make: (v) => (delete v.promise.bro, v), path: "promise.bro" },
  { type: "sector_hero", name: "more than 6 roles", make: (v) => ((v.roles = Array.from({ length: 7 }, (_, i) => ({ id: `r${i}`, label: bi("Role") }))), v), path: "roles" },
  { type: "sector_hero", name: "promise title blank", make: (v) => ((v.promise.dev.title = bi("", "")), v), path: "promise.dev.title" },
  { type: "lifecycle", name: "stage references unknown role", make: (v) => (v.stages[1].roles.push("ghost"), v), path: "stages.1.roles.2" },
  { type: "lifecycle", name: "no stages", make: (v) => ((v.stages = []), v), path: "stages" },
  { type: "lifecycle", name: "more than 12 stages", make: (v) => ((v.stages = Array.from({ length: 13 }, () => v.stages[0])), v), path: "stages" },
  { type: "role_pains", name: "pains keyed by unknown role", make: (v) => ((v.pains.ghost = { headline: bi(""), items: [] }), v), path: "pains.ghost" },
  { type: "role_pains", name: "pain text blank", make: (v) => ((v.pains.dev.items[0].pain = bi("", "")), v), path: "pains.dev.items.0.pain" },
  { type: "fit", name: "falcon option missing points", make: (v) => (delete v.falcon.points, v), path: "falcon.points" },
  { type: "fit", name: "odoo name blank", make: (v) => ((v.odoo.name = bi("", "")), v), path: "odoo.name" },
  { type: "plan", name: "step title is a plain string", make: (v) => ((v.steps[0].title = "Assessment"), v), path: "steps.0.title" },
  { type: "plan", name: "more than 8 steps", make: (v) => ((v.steps = Array.from({ length: 9 }, () => v.steps[0])), v), path: "steps" },
  { type: "faq_ref", name: "question blank", make: (v) => ((v.items[0].question = bi("", "")), v), path: "items.0.question" },
  { type: "faq_ref", name: "more than 24 items", make: (v) => ((v.items = Array.from({ length: 25 }, () => v.items[0])), v), path: "items" },
  { type: "rich_text", name: "paragraph over 2000 chars", make: (v) => ((v.paragraphs[0] = bi("x".repeat(2001))), v), path: "paragraphs.0.en" },
  { type: "rich_text", name: "paragraphs is not an array", make: (v) => ((v.paragraphs = "text"), v), path: "paragraphs" },
  { type: "contact_info", name: "show flag is not boolean", make: (v) => ((v.show.phone = "yes"), v), path: "show.phone" },
  { type: "contact_info", name: "show flag missing", make: (v) => (delete v.show.social, v), path: "show.social" },
  { type: "demo_form", name: "heading blank", make: (v) => ((v.heading = bi("", "")), v), path: "heading" },
  { type: "demo_form", name: "body missing ar", make: (v) => ((v.body = { en: "Free" }), v), path: "body.ar" },
];

export const clone = <T>(v: T): T => structuredClone(v);
