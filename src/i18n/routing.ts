import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // The URL alone decides the language: unprefixed paths are always English
  // and /ar is Arabic. No redirect from a stored cookie or Accept-Language,
  // so English URLs are stable and the language link works before hydration.
  localeDetection: false,
  localeCookie: false,
});
