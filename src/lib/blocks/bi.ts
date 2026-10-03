import { z } from "zod";

/** A bilingual value. Both sides may be empty unless the field uses `biRequiredSchema`. */
export type Bi = { en: string; ar: string };

export const BI_MAX_LENGTH = 2000;

/** Every user-facing string in a block is a Bi. Reuse this constant by reference. */
export const biSchema = z.object({
  en: z.string().max(BI_MAX_LENGTH),
  ar: z.string().max(BI_MAX_LENGTH),
});

/**
 * A Bi that must have text in at least one language (block headlines).
 * Same object shape as `biSchema`, so form generators can treat both alike
 * (use `isBiSchema` / `fieldKind`).
 */
export const biRequiredSchema = biSchema.refine(
  (v) => v.en.trim() !== "" || v.ar.trim() !== "",
  { message: "Enter text in English or Arabic" },
);

/** True for `biSchema`, `biRequiredSchema` or any object schema with string `en` and `ar` keys. */
export function isBiSchema(schema: unknown): boolean {
  const def = (schema as { def?: { type?: string; shape?: Record<string, { def?: { type?: string } }> } })?.def;
  if (!def || def.type !== "object" || !def.shape) return false;
  const keys = Object.keys(def.shape);
  return (
    keys.length === 2 &&
    def.shape.en?.def?.type === "string" &&
    def.shape.ar?.def?.type === "string"
  );
}

/**
 * Display rule: the locale value; if empty, the other locale; else "".
 * Tolerates a missing value so callers never render `undefined`.
 */
export function pickBi(v: Bi | null | undefined, locale: "en" | "ar"): string {
  if (!v) return "";
  const primary = locale === "ar" ? v.ar : v.en;
  const other = locale === "ar" ? v.en : v.ar;
  if (typeof primary === "string" && primary.trim() !== "") return primary;
  if (typeof other === "string" && other.trim() !== "") return other;
  return "";
}

/**
 * `pickBi` plus where the text came from: `fallback` is true when the locale
 * side was empty and the other language is shown, so renderers can mark that
 * text with its own `lang` and `dir`.
 */
export function pickBiLang(
  v: Bi | null | undefined,
  locale: "en" | "ar",
): { text: string; lang: "en" | "ar"; fallback: boolean } {
  const other = locale === "ar" ? "en" : "ar";
  const own = v?.[locale];
  if (typeof own === "string" && own.trim() !== "") return { text: own, lang: locale, fallback: false };
  const alt = v?.[other];
  if (typeof alt === "string" && alt.trim() !== "") return { text: alt, lang: other, fallback: true };
  return { text: "", lang: locale, fallback: false };
}
