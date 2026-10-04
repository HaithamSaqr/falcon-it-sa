/**
 * Task 12: the admin form generator's schema walker (src/lib/blocks/form-schema.ts).
 * Pure functions only; the React form renders whatever these describe.
 */
import { describe, expect, it } from "vitest";
import { BLOCKS } from "@/lib/blocks/registry";
import { BLOCK_TYPES, type BlockType } from "@/lib/blocks/types";
import { biSchema, biRequiredSchema } from "@/lib/blocks/bi";
import { SEED } from "@/lib/blocks/seed";
import {
  blockForm,
  contentIssues,
  describeSchema,
  emptyValue,
  fieldLabel,
  itemTitle,
  parseSaveError,
  syncRoles,
  type FormField,
  type FormNode,
} from "@/lib/blocks/form-schema";
import { z } from "zod";

function field(node: FormNode, key: string): FormField {
  if (node.kind !== "object") throw new Error(`expected object, got ${node.kind}`);
  const f = node.fields.find((x) => x.key === key);
  if (!f) throw new Error(`no field ${key}`);
  return f;
}

/** Every node kind reachable from a form description. */
function kinds(node: FormNode, out = new Set<string>()): Set<string> {
  out.add(node.kind);
  if (node.kind === "object") node.fields.forEach((f) => kinds(f.node, out));
  if (node.kind === "list") kinds(node.item, out);
  if (node.kind === "roleRecord") kinds(node.value, out);
  return out;
}

describe("describeSchema", () => {
  it.each(BLOCK_TYPES)("describes %s without throwing and without unsupported fields", (type) => {
    const node = blockForm(type);
    expect(node.kind).toBe("object");
    expect(kinds(node).has("unsupported")).toBe(false);
  });

  it("recognises Bi (plain and required) as one bilingual field", () => {
    expect(describeSchema(biSchema)).toMatchObject({ kind: "bi", required: false });
    expect(describeSchema(biRequiredSchema)).toMatchObject({ kind: "bi", required: true });
    const hero = blockForm("hero");
    expect(field(hero, "title").node).toMatchObject({ kind: "bi", required: true, multiline: false });
    expect(field(hero, "subtitle").node).toMatchObject({ kind: "bi", required: false, multiline: true });
  });

  it("unwraps optional and default wrappers (departments image and imageAlt)", () => {
    const dep = blockForm("departments");
    expect(field(dep, "image")).toMatchObject({ optional: true, node: { kind: "image" } });
    expect(field(dep, "imageAlt")).toMatchObject({ optional: true, node: { kind: "bi" } });
    expect(describeSchema(z.string().default("x"))).toMatchObject({ kind: "text" });
    expect(describeSchema(z.boolean().optional())).toMatchObject({ kind: "boolean" });
  });

  it("describes links, icons, numbers, booleans and enums", () => {
    const hero = blockForm("hero");
    const primary = field(hero, "primaryCta").node;
    expect(field(primary, "href").node).toEqual({ kind: "link", allowEmpty: false });
    const secondary = field(hero, "secondaryCta").node;
    expect(field(secondary, "href").node).toEqual({ kind: "link", allowEmpty: true });
    const items = field(blockForm("departments"), "items").node;
    expect(items.kind).toBe("list");
    if (items.kind === "list") expect(field(items.item, "icon").node.kind).toBe("icon");
    expect(field(blockForm("logo_wall"), "limit").node).toEqual({ kind: "number", min: 1, max: 60, integer: true });
    const show = field(blockForm("contact_info"), "show").node;
    expect(field(show, "phone").node.kind).toBe("boolean");
    expect(describeSchema(z.enum(["a", "b"]))).toEqual({ kind: "enum", options: ["a", "b"] });
  });

  it("carries list bounds", () => {
    const life = blockForm("lifecycle");
    expect(field(life, "stages").node).toMatchObject({ kind: "list", min: 1, max: 12 });
    expect(field(life, "roles").node).toMatchObject({ kind: "list", min: 1, max: 6 });
    expect(field(blockForm("faq_ref"), "items").node).toMatchObject({ kind: "list", min: 0, max: 24 });
  });

  it("turns role-id lists into role checkboxes and role-keyed records into per-role forms", () => {
    const life = blockForm("lifecycle");
    const stages = field(life, "stages").node;
    if (stages.kind !== "list") throw new Error("stages");
    expect(field(stages.item, "roles").node).toEqual({ kind: "roleRefs", max: 6 });
    const summary = field(life, "summary").node;
    expect(summary.kind).toBe("roleRecord");
    if (summary.kind === "roleRecord") {
      expect(field(summary.value, "headline").node).toMatchObject({ kind: "bi", required: true });
    }
    expect(field(blockForm("sector_hero"), "promise").node.kind).toBe("roleRecord");
    expect(field(blockForm("role_pains"), "pains").node.kind).toBe("roleRecord");
    const roles = field(life, "roles").node;
    if (roles.kind !== "list") throw new Error("roles");
    expect(field(roles.item, "id").node.kind).toBe("roleId");
  });

  it("labels fields in plain English", () => {
    expect(fieldLabel("primaryCta")).toBe("Primary button");
    expect(fieldLabel("href")).toBe("Link");
    expect(fieldLabel("imageAlt")).toBe("Image description (alt text)");
    expect(fieldLabel("sectorPills")).toBe("Sector pills");
    expect(field(blockForm("hero"), "title").label).toBe("Title");
  });
});

describe("emptyValue", () => {
  it.each(BLOCK_TYPES)("builds a value of the right shape for %s", (type) => {
    const v = emptyValue(blockForm(type)) as Record<string, unknown>;
    const defaults = BLOCKS[type].defaults() as Record<string, unknown>;
    // Same required keys as the defaults; optional keys are left out.
    const required = (blockForm(type) as Extract<FormNode, { kind: "object" }>).fields
      .filter((f) => !f.optional)
      .map((f) => f.key)
      .sort();
    expect(Object.keys(v).sort()).toEqual(required);
    for (const k of required) expect(k in defaults).toBe(true);
  });

  it("fills Bi, lists to their minimum, and records empty", () => {
    expect(emptyValue({ kind: "bi", required: true, multiline: false })).toEqual({ en: "", ar: "" });
    const life = emptyValue(blockForm("lifecycle")) as { stages: unknown[]; roles: unknown[]; summary: object };
    expect(life.stages).toHaveLength(1);
    expect(life.roles).toHaveLength(1);
    expect(life.summary).toEqual({});
    expect(emptyValue({ kind: "number", min: 1, max: 60, integer: true })).toBe(1);
  });
});

describe("contentIssues", () => {
  it("returns every issue with its path, not just the first", () => {
    const content = BLOCKS.hero.defaults();
    content.title = { en: "", ar: "" };
    content.primaryCta.href = "javascript:alert(1)";
    const issues = contentIssues("hero", content);
    const paths = issues.map((i) => i.path);
    expect(paths).toContain("title");
    expect(paths).toContain("primaryCta.href");
  });

  it("is empty for every seeded block", () => {
    for (const [page, blocks] of Object.entries(SEED)) {
      for (const b of blocks) expect(contentIssues(b.type, b.content), `${page} ${b.type}`).toEqual([]);
    }
  });

  it("reports an unknown block type", () => {
    expect(contentIssues("nope" as BlockType, {})[0].path).toBe("type");
  });
});

describe("parseSaveError", () => {
  it("splits the API error into block index, field path and message", () => {
    expect(parseSaveError("blocks.2.content.primaryCta.href: Use a path starting with / or an https:// URL")).toEqual({
      index: 2,
      path: "primaryCta.href",
      message: "Use a path starting with / or an https:// URL",
    });
    expect(parseSaveError("blocks.0.content: Invalid input")).toEqual({ index: 0, path: "", message: "Invalid input" });
    expect(parseSaveError("blocks.4.type: unknown block type \"x\"")).toEqual({
      index: 4,
      path: "type",
      message: 'unknown block type "x"',
    });
    expect(parseSaveError("Unauthorized")).toBeNull();
  });
});

describe("itemTitle", () => {
  it("uses the first filled bilingual text", () => {
    const stages = field(blockForm("lifecycle"), "stages").node;
    if (stages.kind !== "list") throw new Error("stages");
    expect(itemTitle(stages.item, { title: { en: "", ar: "عرض" }, description: { en: "x", ar: "" } })).toBe("عرض");
    expect(itemTitle(stages.item, { title: { en: "", ar: "" }, description: { en: "", ar: "" } })).toBe("");
    const roles = field(blockForm("lifecycle"), "roles").node;
    if (roles.kind !== "list") throw new Error("roles");
    expect(itemTitle(roles.item, { id: "dev", label: { en: "Developer", ar: "" } })).toBe("Developer");
    expect(itemTitle(roles.item, { id: "dev", label: { en: "", ar: "" } })).toBe("dev");
  });
});

describe("syncRoles", () => {
  const node = blockForm("lifecycle");
  const base = () => ({
    ...BLOCKS.lifecycle.defaults(),
    roles: [
      { id: "dev", label: { en: "Developer", ar: "" } },
      { id: "fin", label: { en: "Finance", ar: "" } },
    ],
    stages: [{ title: { en: "Plan", ar: "" }, description: { en: "", ar: "" }, modules: { en: "", ar: "" }, roles: ["dev", "fin"] }],
    summary: {
      dev: { headline: { en: "D", ar: "" }, points: [] },
      fin: { headline: { en: "F", ar: "" }, points: [] },
    },
  });

  it("renames a role id in records and stage checkboxes", () => {
    const prev = base();
    const next = { ...prev, roles: [{ id: "developer", label: prev.roles[0].label }, prev.roles[1]] };
    const out = syncRoles(node, prev, next) as ReturnType<typeof base> & { summary: Record<string, unknown> };
    expect(Object.keys(out.summary).sort()).toEqual(["developer", "fin"]);
    expect(out.summary.developer).toEqual(prev.summary.dev);
    expect(out.stages[0].roles).toEqual(["developer", "fin"]);
  });

  it("drops a removed role from records and stage checkboxes", () => {
    const prev = base();
    const next = { ...prev, roles: [prev.roles[1]] };
    const out = syncRoles(node, prev, next) as ReturnType<typeof base>;
    expect(Object.keys(out.summary)).toEqual(["fin"]);
    expect(out.stages[0].roles).toEqual(["fin"]);
  });

  it("never merges into another role's entry", () => {
    const prev = base();
    const next = { ...prev, roles: [{ id: "fin", label: prev.roles[0].label }, prev.roles[1]] };
    const out = syncRoles(node, prev, next) as ReturnType<typeof base>;
    expect(out.summary).toEqual(prev.summary);
    expect(out.stages[0].roles).toEqual(["dev", "fin"]);
  });

  it("leaves reordering alone", () => {
    const prev = base();
    const next = { ...prev, roles: [prev.roles[1], prev.roles[0]] };
    expect(syncRoles(node, prev, next)).toEqual(next);
  });
});
