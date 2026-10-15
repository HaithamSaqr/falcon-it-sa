/**
 * The Egyptian company (Falcon IT Smart Solutions LLC) shown to visitors in
 * Egypt only (owner, 2026-10-15): legal name, registered address, commercial
 * register and tax numbers, and "starts from" prices in EGP. Edited in
 * Settings > Egypt; stored as one JSON object on site_settings.
 * Client-safe: no database or Node imports.
 */
export interface EgyptEntity {
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  /** Commercial register number. */
  crNumber: string;
  /** Tax registration number. */
  taxNumber: string;
  /** Starting prices in EGP as shown ("25,000"); empty = no price line. */
  odooFromEgp: string;
  falconFromEgp: string;
}

export const EMPTY_EGYPT_ENTITY: EgyptEntity = {
  nameEn: "",
  nameAr: "",
  addressEn: "",
  addressAr: "",
  crNumber: "",
  taxNumber: "",
  odooFromEgp: "",
  falconFromEgp: "",
};

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

/** Digits with thousands separators only ("25,000", "25000.50"); anything else is dropped. */
export function egpAmount(v: unknown): string {
  const s = text(v, 20).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return /^\d{1,3}(?:[, ]?\d{3})*(?:\.\d{1,2})?$/.test(s) ? s : "";
}

export function normalizeEgyptEntity(raw: unknown): EgyptEntity {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    nameEn: text(r.nameEn, 160),
    nameAr: text(r.nameAr, 160),
    addressEn: text(r.addressEn, 300),
    addressAr: text(r.addressAr, 300),
    crNumber: text(r.crNumber, 40),
    taxNumber: text(r.taxNumber, 40),
    odooFromEgp: egpAmount(r.odooFromEgp),
    falconFromEgp: egpAmount(r.falconFromEgp),
  };
}
