/**
 * Cookie consent for the Snap Pixel (owner decision 2026-10-04). No
 * dependencies, so the server layout and the client banner share it.
 *
 * The choice is a first-party cookie kept for 12 months. No cookie (or any
 * other value) means no choice yet, which counts as not consented: the Snap
 * Pixel stays off until the visitor accepts. Google Tag Manager, GA4 and
 * Google Ads are not governed by this cookie.
 */

export const CONSENT_COOKIE = "falcon_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;
/** Dispatched on window by the footer "Cookie settings" link to reopen the banner. */
export const OPEN_CONSENT_EVENT = "falcon:open-consent";

export type Consent = "granted" | "denied";

export function parseConsent(value: string | null | undefined): Consent | null {
  return value === "granted" || value === "denied" ? value : null;
}

/** The stored choice from a Cookie header or `document.cookie`. */
export function readConsent(cookieString: string): Consent | null {
  for (const part of cookieString.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === CONSENT_COOKIE) return parseConsent(part.slice(eq + 1).trim());
  }
  return null;
}

/** `document.cookie` assignment for the choice. */
export function consentCookie(value: Consent, secure: boolean): string {
  return `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** First-party cookies the Snap Pixel sets on this site (`_scid`, `_sctr`, ...), cleared on decline. */
export function snapCookieNames(cookieString: string): string[] {
  return cookieString
    .split(";")
    .map((p) => p.split("=")[0].trim())
    .filter((name) => name.startsWith("_sc"));
}
