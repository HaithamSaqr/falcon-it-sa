/**
 * Task 12: checks on the v2 settings fields (primary CTA, demo URL, CR, VAT),
 * shared by the settings admin screen and PUT /api/admin/settings.
 */
import { describe, expect, it } from "vitest";
import { validateV2Settings } from "@/lib/admin/settings-validation";

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
});
