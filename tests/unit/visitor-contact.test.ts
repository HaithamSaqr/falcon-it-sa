/**
 * Owner decision 2026-10-15: visitors in Egypt (by IP) call and WhatsApp the
 * Egypt number; everyone else keeps the Saudi one. The Egypt office stays hidden.
 */
import { describe, expect, it } from "vitest";
import { buildPublicSettings, displayPhone, egyptContact, routedWhatsapp, telHref, type VisitorContext } from "@/lib/public-chrome";
import { DEFAULT_FOOTER_LINKS, DEFAULT_INTEGRATIONS, DEFAULT_PRODUCTS, DEFAULT_SECTORS, DEFAULT_SETTINGS } from "@/lib/db/defaults";
import type { SiteSettings } from "@/types/admin";

const KSA_PHONE = "+966568842663";
const EG_PHONE = "+201132323095";

const SETTINGS: SiteSettings = {
  ...DEFAULT_SETTINGS,
  company: {
    ...DEFAULT_SETTINGS.company,
    phone: { ksa: KSA_PHONE, egypt: EG_PHONE },
    whatsapp: "966568842663",
    branches: [
      {
        id: "ksa",
        name: { en: "Saudi Arabia Office", ar: "مكتب السعودية" },
        address: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
        phone: KSA_PHONE,
      },
      {
        id: "egypt",
        name: { en: "Egypt Office", ar: "مكتب مصر" },
        address: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
        phone: EG_PHONE,
      },
    ],
  },
  whatsappRouting: {
    domains: [{ id: "d1", domain: "falcon-it.sa", number: "966568842663" }],
    countries: [
      { id: "c1", country: "SA", number: "966568842663" },
      { id: "c2", country: "EG", number: "201132323095" },
      { id: "c3", country: "AE", number: "971500000001" },
    ],
  },
};

function build(visitor?: VisitorContext, settings: SiteSettings = SETTINGS) {
  return buildPublicSettings({
    settings,
    footerLinks: DEFAULT_FOOTER_LINKS,
    products: DEFAULT_PRODUCTS.filter((p) => p.enabled),
    sectors: DEFAULT_SECTORS.filter((s) => s.enabled),
    integrations: DEFAULT_INTEGRATIONS,
    visitor,
  });
}

describe("contact numbers by visitor country", () => {
  it("shows the Egypt phone and WhatsApp to a visitor in Egypt, under the hidden office", () => {
    const s = build({ country: "EG", host: "falcon-it.sa" });
    expect(s.company.phone.ksa).toBe(EG_PHONE);
    expect(s.company.whatsapp).toBe("201132323095");
    expect(s.company.branches.map((b) => [b.id, b.phone])).toEqual([["ksa", EG_PHONE]]);
    expect(JSON.stringify(s)).not.toMatch(/cairo|القاهرة|Egypt Office/i);
  });

  it("keeps the Saudi numbers for Saudi, other and unknown visitors", () => {
    for (const visitor of [{ country: "SA" }, { country: "US" }, { country: "" }, undefined]) {
      const s = build(visitor);
      expect(s.company.phone.ksa).toBe(KSA_PHONE);
      expect(s.company.whatsapp).toBe("966568842663");
      expect(s.company.branches[0].phone).toBe(KSA_PHONE);
    }
  });

  it("still applies other country rules and domain rules outside Egypt", () => {
    expect(build({ country: "ae" }).company.whatsapp).toBe("971500000001");
    expect(
      routedWhatsapp({ domains: [{ id: "x", domain: "https://falcon-v.com/", number: "966500000002" }], countries: [] }, { host: "www.falcon-v.com:443" }, "966568842663"),
    ).toBe("966500000002");
  });

  it("never routes anyone outside Egypt to an Egyptian number", () => {
    expect(
      routedWhatsapp({ domains: [{ id: "x", domain: "falcon-it.sa", number: "201132323095" }], countries: [] }, { host: "falcon-it.sa", country: "SA" }, "966568842663"),
    ).toBe("966568842663");
  });

  it("falls back to the Saudi numbers in Egypt when no Egypt phone is set", () => {
    const noEgypt = { ...SETTINGS, company: { ...SETTINGS.company, phone: { ksa: KSA_PHONE, egypt: "" } } };
    expect(egyptContact(noEgypt, { country: "EG" })).toBeNull();
    expect(build({ country: "EG" }, noEgypt).company.phone.ksa).toBe(KSA_PHONE);
  });

  it("uses the Egypt phone for WhatsApp when there is no EG routing rule", () => {
    const noRule = { ...SETTINGS, whatsappRouting: { domains: [], countries: [] } };
    expect(egyptContact(noRule, { country: "EG" })).toEqual({ phone: EG_PHONE, whatsapp: "201132323095" });
  });
});

describe("Egyptian phone display", () => {
  it("formats Egyptian mobiles for people and tel: links", () => {
    expect(displayPhone("+201132323095")).toBe("+20 11 3232 3095");
    expect(displayPhone("00201132323095")).toBe("+20 11 3232 3095");
    expect(telHref("+20 11 3232 3095")).toBe("tel:+201132323095");
    expect(telHref("201132323095")).toBe("tel:+201132323095");
    expect(displayPhone("+966568842663")).toBe("+966 56 884 2663");
  });
});
