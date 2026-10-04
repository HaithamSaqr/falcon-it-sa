/**
 * Builds qa/screens/review.html: one contact sheet of the QA screenshots taken
 * by tests/e2e/screens.spec.ts, grouped by route, English and Arabic side by
 * side (desktop 1440 first, then mobile 390). Open it straight from disk.
 *
 *   node scripts/qa/contact-sheet.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { localeUrls, routeSlug } from "./public-routes.mjs";

const DIR = path.join(process.cwd(), "qa", "screens");
const routes = JSON.parse(fs.readFileSync(path.join(DIR, "routes.json"), "utf8"));
const files = new Set(fs.readdirSync(DIR));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function shot(route, locale, width) {
  const file = `${routeSlug(route)}__${locale}__${width}.png`;
  const url = localeUrls(route)[locale];
  const label = `${locale === "en" ? "English" : "العربية"} · ${url}`;
  if (!files.has(file)) return `<figure class="missing"><figcaption>${esc(label)}</figcaption><p>No screenshot</p></figure>`;
  return `<figure>
  <figcaption><span>${esc(label)}</span><a href="${esc(file)}" target="_blank">Open full size</a></figcaption>
  <div class="frame w${width}"><img src="${esc(file)}" alt="${esc(`${url} at ${width}px`)}" loading="lazy"></div>
</figure>`;
}

const sections = routes
  .map(
    (route, i) => `<section id="${esc(routeSlug(route))}">
  <h2><span class="n">${i + 1}</span>${esc(route)}</h2>
  <h3>Desktop, 1440 wide</h3>
  <div class="pair">${shot(route, "en", 1440)}${shot(route, "ar", 1440)}</div>
  <h3>Mobile, 390 wide</h3>
  <div class="pair mobile">${shot(route, "en", 390)}${shot(route, "ar", 390)}</div>
</section>`,
  )
  .join("\n");

const index = routes.map((r) => `<a href="#${esc(routeSlug(r))}">${esc(r)}</a>`).join("");
const taken = new Date().toISOString().slice(0, 16).replace("T", " ");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Falcon website v2 review</title>
<style>
  :root { --page:#F5F7FA; --surface:#FFFFFF; --ink:#0B1A33; --body:#3A4860; --muted:#5B6880; --brand:#1466C2; --sky:#E4F0FB; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); color: var(--ink); font: 15px/1.5 "Segoe UI", system-ui, -apple-system, sans-serif; }
  header { position: sticky; top: 0; z-index: 2; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); box-shadow: 0 1px 0 rgba(11,26,51,.08); padding: 14px 24px; }
  header h1 { margin: 0; font-size: 20px; }
  header p { margin: 2px 0 8px; color: var(--muted); font-size: 13px; }
  nav { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
  nav a { flex: none; padding: 4px 10px; border-radius: 999px; background: var(--sky); color: var(--brand); text-decoration: none; font-size: 13px; }
  main { padding: 8px 24px 64px; max-width: 1600px; margin: 0 auto; }
  section { margin-top: 32px; padding: 20px; background: var(--surface); border-radius: 18px; box-shadow: 0 0 0 1px rgba(11,26,51,.06); scroll-margin-top: 110px; }
  h2 { margin: 0 0 4px; font-size: 22px; display: flex; gap: 10px; align-items: center; }
  h2 .n { font-size: 13px; color: var(--muted); font-weight: 500; }
  h3 { margin: 16px 0 8px; font-size: 13px; font-weight: 600; color: var(--muted); }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pair.mobile { grid-template-columns: repeat(2, minmax(0, 390px)); }
  figure { margin: 0; min-width: 0; }
  figcaption { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--body); margin-bottom: 6px; }
  figcaption a { color: var(--brand); }
  .frame { max-height: 760px; overflow: auto; border-radius: 10px; box-shadow: 0 0 0 1px rgba(11,26,51,.12); background: var(--page); }
  .frame img { display: block; width: 100%; height: auto; }
  .missing p { color: var(--muted); }
  @media (max-width: 900px) { .pair, .pair.mobile { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Falcon website v2: every public page</h1>
  <p>${routes.length} routes, English and Arabic side by side, desktop (1440) then mobile (390). Screenshots taken ${esc(taken)} UTC from the local production build. Scroll inside a frame to see the whole page.</p>
  <nav>${index}</nav>
</header>
<main>
${sections}
</main>
</body>
</html>
`;

fs.writeFileSync(path.join(DIR, "review.html"), html);
console.log(`qa/screens/review.html: ${routes.length} routes`);
