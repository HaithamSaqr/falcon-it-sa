/**
 * Admin form generator, pure part: walks a block's Zod schema into a small
 * form description the React editor renders (src/components/admin/block-form).
 * Client-safe (zod and the block schemas only).
 *
 * Recognised shapes: Bi (plain and required), link / image / icon / role-id
 * strings (by schema identity, see `fieldKind`), plain strings, numbers,
 * booleans, enums, objects, arrays (with min/max), arrays of role ids (role
 * checkboxes) and records keyed by role id (one sub-form per declared role).
 * Optional, default and nullable wrappers are unwrapped.
 */
import { fieldKind, roleIdSchema } from "./fields";
import { BLOCKS } from "./registry";
import { isBlockType, type BlockType } from "./types";

export type FormNode =
  | { kind: "bi"; required: boolean; multiline: boolean }
  | { kind: "link"; allowEmpty: boolean }
  | { kind: "image" }
  | { kind: "icon" }
  | { kind: "roleId" }
  | { kind: "text"; multiline: boolean; maxLength?: number }
  | { kind: "number"; min?: number; max?: number; integer: boolean }
  | { kind: "boolean" }
  | { kind: "enum"; options: string[] }
  | { kind: "object"; fields: FormField[] }
  | { kind: "list"; item: FormNode; min: number; max?: number }
  | { kind: "roleRefs"; max?: number }
  | { kind: "roleRecord"; value: FormNode }
  | { kind: "unsupported"; zodType: string };

export type FormField = {
  key: string;
  label: string;
  /** The key may be missing from the content (ZodOptional). */
  optional: boolean;
  hint?: string;
  node: FormNode;
};

type ZodLike = {
  def?: {
    type?: string;
    shape?: Record<string, unknown>;
    element?: unknown;
    innerType?: unknown;
    keyType?: unknown;
    valueType?: unknown;
    entries?: Record<string, string | number>;
  };
  _zod?: { bag?: { minimum?: number; maximum?: number; format?: string } };
  minValue?: number | null;
  maxValue?: number | null;
  isInt?: boolean;
  maxLength?: number | null;
};

/** Bilingual fields whose text runs to a sentence or more get a textarea. */
const LONG_KEYS = new Set([
  "subtitle",
  "body",
  "intro",
  "description",
  "line",
  "fix",
  "pain",
  "answer",
  "paragraphs",
  "text",
  "note",
  "privacyNote",
  "closing",
  "when",
  "points",
  "trustLine",
  "caption",
]);

const LABELS: Record<string, string> = {
  primaryCta: "Primary button",
  secondaryCta: "Second button (optional)",
  cta: "Button",
  link: "Link button (optional)",
  href: "Link",
  alt: "Image description (alt text)",
  imageAlt: "Image description (alt text)",
  photoAlt: "Photo description (alt text)",
  logoAlt: "Logo description (alt text)",
  ctaLabel: "Button label",
  id: "Role id",
  roles: "Roles",
  limit: "How many logos to show",
  yourRoleLabel: "\"Your role\" label",
  rolePrompt: "Role picker prompt",
  sectorsLabel: "Sector pills label",
  trustLine: "Trust line",
  otherCard: "Closing card",
  odoo: "Odoo",
  falcon: "Falcon ERP",
  show: "Show on the page",
  whatsapp: "WhatsApp",
};

const HINTS: Record<string, string> = {
  secondaryCta: "Leave the label and the link empty to hide this button.",
  link: "Leave the label and the link empty to hide this button.",
  roles:
    "Role ids are short lowercase slugs (for example owner). Renaming or removing a role here updates this block's role texts and stage checkboxes.",
  limit: "Logos come from Clients in the admin.",
  modules: "Modules used in this stage.",
};

/** Plain-English label for a schema key ("primaryCta" -> "Primary button"). */
export function fieldLabel(key: string): string {
  if (Object.hasOwn(LABELS, key)) return LABELS[key];
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function unwrap(schema: unknown): { schema: ZodLike; optional: boolean } {
  let s = schema as ZodLike;
  let optional = false;
  for (let i = 0; i < 10; i++) {
    const t = s?.def?.type;
    if (t === "optional" || t === "nullable" || t === "default" || t === "prefault" || t === "readonly") {
      if (t === "optional") optional = true;
      s = s.def!.innerType as ZodLike;
    } else break;
  }
  return { schema: s, optional };
}

/** Describe one schema. `key` is the field name it sits under (used for textarea and label choices). */
export function describeSchema(schema: unknown, key = ""): FormNode {
  const { schema: s } = unwrap(schema);
  const special = fieldKind(s);
  if (special === "bi") {
    const required = (s as { def?: { checks?: unknown[] } }).def?.checks?.length ? true : false;
    return { kind: "bi", required, multiline: LONG_KEYS.has(key) };
  }
  if (special === "link") return { kind: "link", allowEmpty: (s as { safeParse: (v: unknown) => { success: boolean } }).safeParse("").success };
  if (special === "image") return { kind: "image" };
  if (special === "icon") return { kind: "icon" };
  if (special === "roleId") return { kind: "roleId" };

  const def = s?.def;
  switch (def?.type) {
    case "string":
      return {
        kind: "text",
        multiline: LONG_KEYS.has(key),
        ...(typeof s.maxLength === "number" ? { maxLength: s.maxLength } : {}),
      };
    case "number": {
      const node: FormNode = { kind: "number", integer: s.isInt === true };
      if (typeof s.minValue === "number" && Number.isFinite(s.minValue)) node.min = s.minValue;
      if (typeof s.maxValue === "number" && Number.isFinite(s.maxValue)) node.max = s.maxValue;
      return node;
    }
    case "boolean":
      return { kind: "boolean" };
    case "enum":
      return { kind: "enum", options: Object.values(def.entries ?? {}).map(String) };
    case "object": {
      const fields = Object.entries(def.shape ?? {}).map(([k, child]): FormField => {
        const { optional } = unwrap(child);
        const field: FormField = { key: k, label: fieldLabel(k), optional, node: describeSchema(child, k) };
        if (Object.hasOwn(HINTS, k)) field.hint = HINTS[k];
        return field;
      });
      return { kind: "object", fields };
    }
    case "array": {
      const bag = s._zod?.bag ?? {};
      const element = unwrap(def.element).schema;
      if (element === (roleIdSchema as unknown)) {
        return { kind: "roleRefs", ...(typeof bag.maximum === "number" ? { max: bag.maximum } : {}) };
      }
      return {
        kind: "list",
        item: describeSchema(def.element, key),
        min: typeof bag.minimum === "number" ? bag.minimum : 0,
        ...(typeof bag.maximum === "number" ? { max: bag.maximum } : {}),
      };
    }
    case "record": {
      if (unwrap(def.keyType).schema === (roleIdSchema as unknown)) {
        return { kind: "roleRecord", value: describeSchema(def.valueType, key) };
      }
      return { kind: "unsupported", zodType: "record" };
    }
    default:
      return { kind: "unsupported", zodType: String(def?.type ?? typeof s) };
  }
}

const cache = new Map<BlockType, FormNode>();

/** Form description of a block type's content (cached). */
export function blockForm(type: BlockType): FormNode {
  let node = cache.get(type);
  if (!node) {
    node = describeSchema(BLOCKS[type].schema);
    cache.set(type, node);
  }
  return node;
}

/** A blank value of the right shape (lists filled to their minimum, optional keys left out). */
export function emptyValue(node: FormNode): unknown {
  switch (node.kind) {
    case "bi":
      return { en: "", ar: "" };
    case "link":
    case "image":
    case "icon":
    case "roleId":
    case "text":
      return "";
    case "number":
      return node.min ?? 0;
    case "boolean":
      return false;
    case "enum":
      return node.options[0] ?? "";
    case "object":
      return Object.fromEntries(node.fields.filter((f) => !f.optional).map((f) => [f.key, emptyValue(f.node)]));
    case "list":
      return Array.from({ length: node.min }, () => emptyValue(node.item));
    case "roleRefs":
      return [];
    case "roleRecord":
      return {};
    default:
      return null;
  }
}

export type ContentIssue = { path: string; message: string };

/** Every validation issue of a block's content, with dotted paths relative to the content. */
export function contentIssues(type: BlockType | string, content: unknown): ContentIssue[] {
  if (!isBlockType(type)) return [{ path: "type", message: `Unknown block type "${type}"` }];
  const result = BLOCKS[type].schema.safeParse(content);
  if (result.success) return [];
  return result.error.issues.map((i) => ({ path: i.path.map(String).join("."), message: i.message }));
}

/** Splits a save error ("blocks.<i>.content.<path>: <message>") into its parts; null for other errors. */
export function parseSaveError(error: string): { index: number; path: string; message: string } | null {
  const m = /^blocks\.(\d+)\.(content(?:\.[^:\s]+)?|type|id|enabled)(?::\s)([\s\S]*)$/.exec(error);
  if (!m) return null;
  const where = m[2];
  const path = where === "content" ? "" : where.startsWith("content.") ? where.slice("content.".length) : where;
  return { index: Number(m[1]), path, message: m[3] };
}

/** Short title for a list item: its first filled bilingual or text value. */
export function itemTitle(node: FormNode, value: unknown): string {
  if (value == null) return "";
  if (node.kind === "bi") {
    const v = value as { en?: string; ar?: string };
    return (v.en?.trim() || v.ar?.trim() || "").slice(0, 80);
  }
  if (node.kind === "text" || node.kind === "roleId") return String(value).slice(0, 80);
  if (node.kind === "object" && typeof value === "object") {
    // Bilingual text first (a role reads "Developer", not "dev"), then plain text.
    for (const kinds of [["bi"], ["text", "roleId"]]) {
      for (const f of node.fields) {
        if (!kinds.includes(f.node.kind)) continue;
        const t = itemTitle(f.node, (value as Record<string, unknown>)[f.key]);
        if (t) return t;
      }
    }
  }
  return "";
}

type Obj = Record<string, unknown>;

/** Apply `fn` to every role-keyed record and role-id list inside a value. */
function mapRoleFields(
  node: FormNode,
  value: unknown,
  fn: { record: (r: Obj) => Obj; refs: (ids: string[]) => string[] },
): unknown {
  if (value == null) return value;
  switch (node.kind) {
    case "roleRecord":
      return typeof value === "object" ? fn.record(value as Obj) : value;
    case "roleRefs":
      return Array.isArray(value) ? fn.refs(value as string[]) : value;
    case "list":
      return Array.isArray(value) ? value.map((v) => mapRoleFields(node.item, v, fn)) : value;
    case "object": {
      if (typeof value !== "object") return value;
      const out: Obj = { ...(value as Obj) };
      for (const f of node.fields) {
        if (f.key in out) out[f.key] = mapRoleFields(f.node, out[f.key], fn);
      }
      return out;
    }
    default:
      return value;
  }
}

function roleIds(content: unknown): string[] {
  const roles = (content as { roles?: unknown })?.roles;
  return Array.isArray(roles) ? roles.map((r) => String((r as { id?: unknown })?.id ?? "")) : [];
}

/**
 * Keep role-keyed texts and stage checkboxes in step with an edit of the
 * block's `roles` list: a renamed id moves its entries, a removed role drops
 * them. Never merges into another role's entry, and ignores reorders and adds.
 * `node` is the block's form description; `next` is the content after the edit.
 */
export function syncRoles(node: FormNode, prev: unknown, next: unknown): unknown {
  const before = roleIds(prev);
  const after = roleIds(next);
  if (node.kind !== "object" || !node.fields.some((f) => f.key === "roles")) return next;
  const count = (ids: string[], id: string) => ids.filter((x) => x === id).length;

  if (before.length === after.length) {
    const changed = before.map((id, i) => i).filter((i) => before[i] !== after[i]);
    if (changed.length !== 1) return next;
    const from = before[changed[0]];
    const to = after[changed[0]];
    if (count(before, from) !== 1 || before.includes(to)) return next;
    return mapRoleFields(node, next, {
      record: (r) =>
        Object.hasOwn(r, from) && !Object.hasOwn(r, to)
          ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k === from ? to : k, v]))
          : r,
      refs: (ids) => ids.map((id) => (id === from ? to : id)),
    });
  }

  if (after.length < before.length) {
    const gone = new Set(before.filter((id) => !after.includes(id)));
    if (gone.size === 0) return next;
    return mapRoleFields(node, next, {
      record: (r) => Object.fromEntries(Object.entries(r).filter(([k]) => !gone.has(k))),
      refs: (ids) => ids.filter((id) => !gone.has(id)),
    });
  }
  return next;
}
