/**
 * Task 12: checks on the v2 settings fields (primary CTA, demo URL, CR, VAT),
 * shared by the settings admin screen and PUT /api/admin/settings.
 */
import { describe, expect, it } from "vitest";
import { normalizeV2Settings, validateV2Settings } from "@/lib/admin/settings-validation";

const ok = {
  blogEnabled: false,
  primaryCta: { label: { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" }, demoUrl: "/demo" },
  company: { crNumber: "7049432656", vatNumber: "311410985900003" },
};

describe("validateV2Settings", () => {
  it("accepts the shipped values", () => {
    expect(validateV2Settings(ok)).toBeNull();
  });

  it("accepts a payload without the v2 fields (older admin client)", () => {
    expect(validateV2Settings({ company: {} })).toBeNull();
    expect(validateV2Settings({})).toBeNull();
  });

  it.each(["javascript:alert(1)", "http://example.com", "//evil.example", "", " /demo", "demo"])(
    "rejects demo URL %j",
    (demoUrl) => {
      const err = validateV2Settings({ ...ok, primaryCta: { ...ok.primaryCta, demoUrl } });
      expect(err).toMatch(/^primaryCta\.demoUrl: /);
    },
  );

  it.each(["/demo", "/ar/demo", "https://calendly.com/falcon/demo"])("accepts demo URL %j", (demoUrl) => {
    expect(validateV2Settings({ ...ok, primaryCta: { ...ok.primaryCta, demoUrl } })).toBeNull();
  });

  it("needs the button label in at least one language", () => {
    expect(validateV2Settings({ ...ok, primaryCta: { ...ok.primaryCta, label: { en: " ", ar: "" } } })).toMatch(
      /^primaryCta\.label: /,
    );
    expect(validateV2Settings({ ...ok, primaryCta: { ...ok.primaryCta, label: { en: "", ar: "احجز" } } })).toBeNull();
  });

  it("checks the CR and VAT numbers when given", () => {
    expect(validateV2Settings({ ...ok, company: { crNumber: "12ab" } })).toMatch(/^company\.crNumber: /);
    expect(validateV2Settings({ ...ok, company: { vatNumber: "31141098590000" } })).toMatch(/^company\.vatNumber: /);
    expect(validateV2Settings({ ...ok, company: { crNumber: "", vatNumber: "" } })).toBeNull();
    expect(validateV2Settings({ ...ok, company: { crNumber: " 7049432656 " } })).toBeNull();
  });

  it("rejects a non-boolean blog flag", () => {
    expect(validateV2Settings({ ...ok, blogEnabled: "yes" })).toMatch(/^blogEnabled: /);
  });

  it("caps the button label at 60 characters in each language", () => {
    const label = (en: string, ar: string) => ({ ...ok, primaryCta: { ...ok.primaryCta, label: { en, ar } } });
    expect(validateV2Settings(label("x".repeat(60), "ع".repeat(60)))).toBeNull();
    expect(validateV2Settings(label("x".repeat(61), ""))).toMatch(/^primaryCta\.label: .*60/);
    expect(validateV2Settings(label("", "ع".repeat(61)))).toMatch(/^primaryCta\.label: .*60/);
    // Surrounding spaces do not count.
    expect(validateV2Settings(label(` ${"x".repeat(60)} `, ""))).toBeNull();
  });
});

describe("normalizeV2Settings", () => {
  it("trims the CR and VAT numbers and the button labels", () => {
    const out = normalizeV2Settings({
      ...ok,
      company: { name: "x", crNumber: " 7049432656 ", vatNumber: "\t311410985900003\n" },
      primaryCta: { label: { en: " Book a demo ", ar: " احجز " }, demoUrl: " /demo " },
    });
    expect(out.company).toEqual({ name: "x", crNumber: "7049432656", vatNumber: "311410985900003" });
    expect(out.primaryCta).toEqual({ label: { en: "Book a demo", ar: "احجز" }, demoUrl: "/demo" });
    expect(validateV2Settings(out)).toBeNull();
  });

  it("leaves missing fields missing and does not touch the input", () => {
    const input = { company: { email: "a@b.c" } };
    expect(normalizeV2Settings(input)).toEqual({ company: { email: "a@b.c" } });
    expect(normalizeV2Settings({})).toEqual({});
    const withCr = { company: { crNumber: " 1 " } };
    normalizeV2Settings(withCr);
    expect(withCr.company.crNumber).toBe(" 1 ");
  });
});
