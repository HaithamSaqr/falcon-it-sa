import { z } from "zod";
import { biSchema, biRequiredSchema, isBiSchema, type Bi } from "./bi";

/*
 * Shared leaf schemas. Each is exported as a constant and reused BY REFERENCE
 * so the admin form generator can recognise them with `fieldKind`.
 */

const CONTROL_OR_SPACE = /[\u0000- \u007f\\]/;

/** Relative path ("/demo", "/ar/sectors?x=1") or https URL. No other scheme. */
export function isSafeLink(v: string): boolean {
  if (v.length === 0 || v.length > 500 || CONTROL_OR_SPACE.test(v)) return false;
  if (v.startsWith("/")) return !v.startsWith("//");
  return /^https:\/\/[^/]/.test(v);
}

/** "" (no image) or /images/..., /api/uploads/..., https://... */
export function isSafeImage(v: string): boolean {
  if (v === "") return true;
  if (v.length > 500 || CONTROL_OR_SPACE.test(v)) return false;
  if (v.split("/").includes("..")) return false;
  return (
    v.startsWith("/images/") || v.startsWith("/api/uploads/") || /^https:\/\/[^/]/.test(v)
  );
}

export const linkSchema = z
  .string()
  .max(500)
  .refine(isSafeLink, { message: "Use a path starting with / or an https:// URL" });

/** Same as `linkSchema` but "" means no link. */
export const optionalLinkSchema = z
  .string()
  .max(500)
  .refine((v) => v === "" || isSafeLink(v), {
    message: "Use a path starting with / or an https:// URL, or leave empty",
  });

/** Image path; "" means no image (the renderer falls back). */
export const imageSchema = z
  .string()
  .max(500)
  .refine(isSafeImage, {
    message: "Use /images/..., /api/uploads/... or an https:// URL, or leave empty",
  });

/** Phosphor icon component name, for example "Calculator". */
export const iconSchema = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9]{0,59}$/, { message: "Use a Phosphor icon name such as Calculator" });

/** Short lowercase slug used to key role-aware content. */
export const roleIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_-]{0,23}$/, { message: "Use a short lowercase slug such as dev" });

export type FieldKind = "bi" | "link" | "image" | "icon" | "roleId";

const KINDS = new Map<unknown, FieldKind>([
  [biSchema, "bi"],
  [biRequiredSchema, "bi"],
  [linkSchema, "link"],
  [optionalLinkSchema, "link"],
  [imageSchema, "image"],
  [iconSchema, "icon"],
  [roleIdSchema, "roleId"],
]);

/** What kind of special field is this schema, if any (used by the admin form generator). */
export function fieldKind(schema: unknown): FieldKind | undefined {
  const known = KINDS.get(schema);
  if (known) return known;
  return isBiSchema(schema) ? "bi" : undefined;
}

/** Call to action. */
export const ctaSchema = z.object({ label: biSchema, href: linkSchema });
export type Cta = z.infer<typeof ctaSchema>;

/** Optional call to action: empty label and empty href mean "not shown". */
export const optionalCtaSchema = z.object({ label: biSchema, href: optionalLinkSchema });
export type OptionalCta = z.infer<typeof optionalCtaSchema>;

/** Block-level check: an optional CTA with a label needs a link. */
export function checkOptionalCta(
  cta: OptionalCta,
  path: (string | number)[],
  ctx: z.RefinementCtx,
): void {
  const hasLabel = cta.label.en.trim() !== "" || cta.label.ar.trim() !== "";
  if (hasLabel && cta.href === "") {
    ctx.addIssue({ code: "custom", message: "Add a link or clear the label", path: [...path, "href"] });
  }
}

/** A numbered step with a duration, used by `process` and `plan`. */
export const stepSchema = z.object({
  title: biRequiredSchema,
  description: biSchema,
  duration: biSchema,
});

export function b(en: string, ar = ""): Bi {
  return { en, ar };
}

/** Defaults helper: the global primary CTA. */
export function demoCta() {
  return { label: b("Book a demo", "احجز عرضًا تجريبيًا"), href: "/demo" };
}

/** Defaults helper: no secondary CTA. */
export function noCta() {
  return { label: b(""), href: "" };
}
