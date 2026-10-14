/** Which form sent the visitor to /thank-you; anything unknown reads as a demo booking. */
export type ThankYouType = "demo" | "contact";

export function parseThankYouType(value: string | string[] | undefined): ThankYouType {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "contact" ? "contact" : "demo";
}

/** Locale-free path; the next-intl router adds /ar when needed. */
export function thankYouPath(type: ThankYouType): string {
  return `/thank-you?type=${type}`;
}
