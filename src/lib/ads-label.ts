/**
 * Google Ads conversion labels. The Ads UI shows the label inside the event
 * snippet as `'send_to': 'AW-123456789/AbC123xYz'`; the site only needs the
 * part after the slash.
 */

const SEND_TO = /AW-[A-Za-z0-9]+\/([A-Za-z0-9_-]+)/;

/**
 * If `input` contains a full `AW-…/label` string (alone or inside a pasted
 * snippet), returns just the label. Returns null when there is nothing to
 * extract, so callers can leave the value untouched.
 */
export function extractAdsLabel(input: string): string | null {
  const match = SEND_TO.exec(input);
  return match ? match[1] : null;
}

/** Google Ads IDs look like AW-123456789. An empty value is not flagged. */
export function isValidAdsId(value: string): boolean {
  return /^AW-\d+$/.test(value.trim());
}
