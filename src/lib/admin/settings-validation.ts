/**
 * Checks on the v2 site settings (blog flag, primary CTA, CR and VAT numbers).
 * `normalizeV2Settings` trims them first (both the API and the admin screen).
 * Shared by the settings admin screen and PUT /api/admin/settings. Client-safe.
 * Fields missing from the payload are not checked (the store keeps them).
 */
import { isSafeLink } from "@/lib/blocks/links";

type Payload = {
  blogEnabled?: unknown;
  primaryCta?: { label?: { en?: unknown; ar?: unknown }; demoUrl?: unknown } | null;
  company?: { crNumber?: unknown; vatNumber?: unknown } | null;
};

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Longest main button label (each language), so the navbar stays on one line. */
export const CTA_LABEL_MAX = 60;

/**
 * Copy of the payload with the CR and VAT numbers, the button labels and the
 * demo link trimmed. Missing fields stay missing; the input is not changed.
 * Run before `validateV2Settings` and store the result.
 */
export function normalizeV2Settings<T>(payload: T): T {
  if (!payload || typeof payload !== "object") return payload;
  const s = { ...(payload as Record<string, unknown>) } as Payload & Record<string, unknown>;
  if (s.company && typeof s.company === "object") {
    const company = { ...s.company };
    if (typeof company.crNumber === "string") company.crNumber = company.crNumber.trim();
    if (typeof company.vatNumber === "string") company.vatNumber = company.vatNumber.trim();
    s.company = company;
  }
  if (s.primaryCta && typeof s.primaryCta === "object") {
    const { label, demoUrl } = s.primaryCta;
    s.primaryCta = {
      ...s.primaryCta,
      ...(label && typeof label === "object"
        ? { label: { ...label, en: typeof label.en === "string" ? label.en.trim() : label.en, ar: typeof label.ar === "string" ? label.ar.trim() : label.ar } }
        : {}),
      ...(typeof demoUrl === "string" ? { demoUrl: demoUrl.trim() } : {}),
    };
  }
  return s as T;
}

/** "<field>: <message>" for the first problem, or null when the payload is fine. */
export function validateV2Settings(payload: unknown): string | null {
  const s = (payload ?? {}) as Payload;

  if (s.blogEnabled !== undefined && typeof s.blogEnabled !== "boolean") {
    return "blogEnabled: expected on or off";
  }

  if (s.primaryCta != null) {
    const { label, demoUrl } = s.primaryCta;
    if (text(label?.en) === "" && text(label?.ar) === "") {
      return "primaryCta.label: Enter the button label in English or Arabic";
    }
    if (text(label?.en).length > CTA_LABEL_MAX || text(label?.ar).length > CTA_LABEL_MAX) {
      return `primaryCta.label: Keep the button label to ${CTA_LABEL_MAX} characters or fewer`;
    }
    if (typeof demoUrl !== "string" || !isSafeLink(demoUrl)) {
      return "primaryCta.demoUrl: Use a path starting with / (for example /demo) or an https:// link";
    }
  }

  const cr = s.company?.crNumber;
  if (cr !== undefined && (typeof cr !== "string" || !/^(\d{10})?$/.test(cr.trim()))) {
    return "company.crNumber: The unified national number has 10 digits (or leave it empty)";
  }
  const vat = s.company?.vatNumber;
  if (vat !== undefined && (typeof vat !== "string" || !/^(\d{15})?$/.test(vat.trim()))) {
    return "company.vatNumber: The VAT number has 15 digits (or leave it empty)";
  }
  return null;
}
