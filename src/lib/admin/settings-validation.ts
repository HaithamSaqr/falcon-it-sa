/**
 * Checks on the v2 site settings (blog flag, primary CTA, CR and VAT numbers).
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
