/**
 * Task 13b: the Snap Pixel waits for the visitor's consent. The choice lives
 * in a first-party cookie for 12 months; anything else counts as no choice.
 */
import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  consentCookie,
  parseConsent,
  readConsent,
  snapCookieNames,
} from "@/lib/consent";

describe("consent cookie", () => {
  it("is named falcon_consent and lasts 12 months", () => {
    expect(CONSENT_COOKIE).toBe("falcon_consent");
    expect(CONSENT_MAX_AGE).toBe(60 * 60 * 24 * 365);
  });

  it("parses only the two stored choices", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    for (const v of [undefined, null, "", "yes", "GRANTED", "granted ", "true"]) expect(parseConsent(v)).toBeNull();
  });

  it("reads the choice from a Cookie header or document.cookie string", () => {
    expect(readConsent("")).toBeNull();
    expect(readConsent("a=1; falcon_consent=granted; b=2")).toBe("granted");
    expect(readConsent("falcon_consent=denied")).toBe("denied");
    expect(readConsent("xfalcon_consent=granted")).toBeNull();
    expect(readConsent("falcon_consent=maybe")).toBeNull();
  });

  it("writes a first-party, site-wide, Lax cookie, Secure on https", () => {
    expect(consentCookie("granted", false)).toBe("falcon_consent=granted; Max-Age=31536000; Path=/; SameSite=Lax");
    expect(consentCookie("denied", true)).toBe("falcon_consent=denied; Max-Age=31536000; Path=/; SameSite=Lax; Secure");
  });

  it("finds the Snap first-party cookies to clear on decline", () => {
    expect(snapCookieNames("_scid=1; falcon_consent=granted; _sctr=2; _scid_r=3; other=4; x_sc=5")).toEqual([
      "_scid",
      "_sctr",
      "_scid_r",
    ]);
    expect(snapCookieNames("")).toEqual([]);
  });
});
