/**
 * QA (Task 13): fetch every public route in both locales from a running
 * server and grep the HTML for strings that must never ship.
 *
 *   node scripts/qa/grep-html.mjs http://localhost:3200
 *
 * Prints one line per URL and every hit with context; exits 1 on any hit or
 * on any URL (either locale) that does not answer 200 without a redirect.
 */
import { localeUrls, publicRoutes } from "./public-routes.mjs";

const base = process.argv[2] ?? "http://localhost:3200";

const AR = "\u0620-\u064A\u066E-\u06D3\u06FA-\u06FF\u0750-\u077F\u064B-\u065F\u0670";
const CHECKS = [
  ["em dash", /\u2014/g],
  ["en dash", /\u2013/g],
  // React's flight payload encodes undefined props as "$undefined"; that marker is not page text.
  ["undefined", /(?<!\$)undefined/g],
  ["placeholder phone", /\+?201000000000/g],
  ["localhost", /localhost/gi],
  ["Egypt", /\begypt\b/gi],
  ["مصر (whole word)", new RegExp(`(?<![${AR}])(?:و|ب|ل|ف|ال)?مصر(?![${AR}])`, "g")],
  ["NaN", /\bNaN\b/g],
  ["[object", /\[object/g],
];

const routes = await publicRoutes(base);
let total = 0;
let badStatus = 0;
const rows = [];
for (const route of routes) {
  for (const [locale, url] of Object.entries(localeUrls(route))) {
    const res = await fetch(new URL(url, base), { redirect: "manual" });
    const html = await res.text();
    const hits = [];
    if (res.status !== 200) {
      hits.push(`status ${res.status}${res.headers.get("location") ? ` -> ${res.headers.get("location")}` : ""}`);
      badStatus++;
    }
    for (const [name, re] of CHECKS) {
      for (const m of html.matchAll(re)) {
        const at = m.index ?? 0;
        hits.push(`${name}: …${html.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, " ")}…`);
      }
    }
    total += hits.length;
    rows.push(`${res.status} ${url} (${locale}) ${html.length} bytes, ${hits.length} hits`);
    for (const h of hits) rows.push(`    ${h}`);
  }
}
console.log(rows.join("\n"));
console.log(`\n${routes.length} routes x 2 locales = ${routes.length * 2} pages, ${total} hits (${badStatus} non-200)`);
process.exit(total === 0 ? 0 : 1);
