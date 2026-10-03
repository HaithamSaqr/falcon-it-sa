# Falcon Website v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every public page of falcon-it.sa in the approved v2 design, with all content editable in admin (EN and AR), SEO and broken-content fixes, then deploy to production with a tested rollback.

**Architecture:** A new `page_blocks` table stores typed, bilingual JSON blocks per page; each block type has one Zod schema that validates admin saves, types the React renderer and drives an auto-generated admin form. Public pages are server components that read blocks (falling back to seed content), with small client islands for the sector and role switchers. Existing typed tables (settings, sectors, clients, faqs, products, leads, integrations) and the lead/booking flow stay.

**Tech Stack:** Next 16 (App Router, standalone), React 19, next-intl 4 (`localePrefix: "as-needed"`), Tailwind v4 (`@theme` in `globals.css`), Postgres via `pg`, Zod 4, `@phosphor-icons/react`, Vitest (unit and DB integration), Playwright (e2e and screenshots), Docker for local Postgres and the production image.

**Spec:** `docs/superpowers/specs/2026-10-03-falcon-website-v2-design.md` (read sections 3 to 12 before any task). Mockups: https://claude.ai/artifact/V6NHF8qBvqLyVU9SBVGc3G

## Global Constraints

- Work only in `D:\Projects\falcon-it.sa-redesign` on branch `feat/website-v2`. Never touch `D:\Projects\falcon-it.sa-live` (another session owns it).
- Node 22, Next 16, React 19, Tailwind v4. New dependencies allowed: `@phosphor-icons/react`, `vitest`, `@playwright/test`. Nothing else without asking.
- Fonts: Schibsted Grotesk 400 to 800 (Latin) and Alexandria 300 to 800 (Arabic) via `next/font/google`, exposed as `--font-sans` and `--font-arabic` through the next/font variables (not literal names).
- Colours: page `#F5F7FA`, surface `#FFFFFF`, ink `#0B1A33`, body `#3A4860`, muted `#5B6880`, brand `#1466C2`, brand-deep `#0D4F9E`, sky `#E4F0FB`, Odoo tint `#F6F1F5`. One accent. Body text contrast at least 4.5:1.
- Copy rules: no em dash or en dash characters anywhere in UI or seed copy; no small uppercase eyebrow above every section; no invented numbers, testimonials or certifications; sentence case.
- Primary CTA label exactly `Book a demo` / `احجز عرضًا تجريبيًا`, linking to `/demo` (locale-prefixed in AR).
- Bilingual values are `{ en: string; ar: string }`. Display rule: show the locale value; if it is empty, show the other locale; never render `undefined` or an empty heading.
- Company data: unified national number `7049432656`, VAT `311410985900003`.
- Motion: CSS only for entrances (`rise` 720ms `cubic-bezier(.16,1,.3,1)`), interaction transitions 160 to 320ms; everything off under `prefers-reduced-motion: reduce`.
- RTL: logical properties only (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`); directional icons flip in RTL.
- Do not change lead API contracts (`/api/leads/demo`, `/api/leads/contact`, `/api/leads/newsletter`), tracking (GTM, GA4, Ads, Snap) or admin auth.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Arabic left empty in admin:** the page shows the English value, never a blank heading. Pinned in Task 2 (`pickBi`) and Task 8 (render test).
2. **Database unreachable at request time:** every public page still renders the seeded v2 content with status 200. Pinned in Task 3 and Task 13.
3. **Admin saves a malformed or partial block:** API returns 400 with the Zod path, nothing is written, the public page is unchanged. Pinned in Task 12.
4. **Production DB already holds old rows** (sector `RetailBasic`, old products, demo testimonials, applications brochure): migrations run twice without error, old sector slugs 301 to their v2 sector, the applications brochure is disabled. Pinned in Task 3 and Task 10.
5. **Long admin text** (a 140-character headline, a 12-item list): no horizontal scroll at 390px or 1440px. Pinned in Task 8 e2e.

---

### Task 1: Tooling, test harness and local database

**Files:**
- Modify: `package.json` (scripts and devDependencies), `eslint.config.mjs` (create flat config if missing)
- Create: `vitest.config.ts`, `playwright.config.ts`, `docker-compose.dev.yml`, `.env.test`, `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: scripts `test` (vitest run), `test:db` (vitest run with `PG*` from `.env.test`), `e2e` (playwright test), `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `db:dev` (compose up a `postgres:16-alpine` on port 55432, db `falcon_test`, user `falcon`, password `falcon`).
- Playwright `baseURL` from `E2E_BASE_URL`, default `http://localhost:3100`; projects `desktop` (1440x900) and `mobile` (390x844).

- [ ] **Step 1:** Install `vitest @playwright/test @phosphor-icons/react`; `npx playwright install chromium`.
- [ ] **Step 2:** Write `tests/unit/smoke.test.ts` asserting `1 + 1 === 2` and `tests/e2e/smoke.spec.ts` asserting `GET /` returns 200 and the `<html>` has `lang="en"`, `GET /ar` has `dir="rtl"`.
- [ ] **Step 3:** Run `npm run test` (PASS), `npm run db:dev`, start the app with `PG*` env pointing at port 55432 on port 3100, run `npm run e2e` (PASS), `npm run typecheck` and `npm run lint` (record existing lint errors in the commit message; fix only those in files this plan touches).
- [ ] **Step 4:** Commit `chore: add vitest, playwright, local postgres and lint scripts`.

### Task 2: Block types and schemas

**Files:**
- Create: `src/lib/blocks/types.ts`, `src/lib/blocks/bi.ts`, `src/lib/blocks/registry.ts`, one file per block type under `src/lib/blocks/schemas/`
- Test: `tests/unit/blocks.test.ts`

**Interfaces:**
- Produces:
  - `type Bi = { en: string; ar: string }`; `const biSchema` (both strings, may be empty, max 2000 chars); `pickBi(v: Bi, locale: "en" | "ar"): string` (locale value, else the other, else `""`).
  - `type BlockType` union: `hero`, `logo_wall`, `departments`, `sector_grid`, `setup_list`, `erp_compare`, `process`, `quote`, `booking`, `sector_hero`, `lifecycle`, `role_pains`, `fit`, `plan`, `faq_ref`, `rich_text`, `contact_info`, `demo_form`.
  - `BLOCKS: Record<BlockType, { schema: ZodType; label: Bi; defaults: () => unknown }>`.
  - `parseBlock(type: string, content: unknown): { ok: true; block: Block } | { ok: false; error: string }` (error is the first Zod issue path and message).
  - `type Block = { id: string; page: string; type: BlockType; sortOrder: number; enabled: boolean; content: <typed per type> }`.
  - Role-aware fields: `roles: { id: string; label: Bi }[]`; `stages: { title: Bi; description: Bi; modules: Bi; roles: string[] }[]`; `promise`, `summary`, `pains` are `Record<roleId, ...>`.
  - Image fields are `string` paths (`/images/v2/...` or `/api/uploads/...`); link fields are `string` relative paths or `https://` URLs (reject `javascript:`).

- [ ] **Step 1:** Write tests: `pickBi({en:"A",ar:""},"ar") === "A"`; `pickBi({en:"",ar:"ب"},"en") === "ب"`; `parseBlock("hero", validHero).ok === true`; `parseBlock("hero", {...validHero, title: "x"}).ok === false` with error containing `title`; `parseBlock("nope", {}).ok === false`; a `lifecycle` block whose stage lists a role id missing from `roles` fails; a link `javascript:alert(1)` fails.
- [ ] **Step 2:** Run `npm run test -- blocks` (FAIL).
- [ ] **Step 3:** Implement the schemas from the mockups' sections (field names are the implementer's choice; every user-facing string is `Bi`).
- [ ] **Step 4:** Run tests (PASS), commit `feat(blocks): typed bilingual block schemas`.

### Task 3: Database tables, store and seeding

**Files:**
- Modify: `src/lib/db/schema.ts` (new DDL and `MIGRATIONS`), `src/lib/db/migrate.ts` (`seedPageBlocks`, one-off data fixes), `src/lib/data-store.ts`, `src/types/admin.ts`
- Create: `src/lib/blocks/store.ts`, `src/lib/blocks/seed/index.ts` plus one seed file per page, `public/images/v2/` (the eight Higgsfield photos, product shots, `logo-falcon-erp.png`, client logos)
- Test: `tests/db/blocks-store.test.ts` (runs under `test:db`)

**Interfaces:**
- Consumes: Task 2 `Block`, `parseBlock`, `BLOCKS`.
- Produces:
  - Tables `page_blocks(id uuid pk, page text, type text, sort_order int, enabled bool default true, content jsonb, updated_at timestamptz)` with index on `(page, sort_order)`; `page_seo(page text pk, title_en, title_ar, description_en, description_ar, og_image text)`.
  - Columns: `sectors.photo text`, `sectors.short_promise_en text`, `sectors.short_promise_ar text`; `site_settings.blog_enabled bool default false`, `site_settings.cta_label_en text`, `site_settings.cta_label_ar text`, `site_settings.demo_url text default '/demo'`.
  - `getPageBlocks(page: string): Promise<Block[]>` (enabled only, ordered; on DB error returns `SEED[page] ?? []`); `getPageBlocksAdmin(page)` (all); `savePageBlocks(page: string, blocks: Block[]): Promise<void>` (transaction: validate all with `parseBlock`, delete page rows, insert); `listPages(): Promise<{ page: string; count: number }[]>`; `getPageSeo(page)`, `savePageSeo(row)`.
  - `SEED: Record<string, Omit<Block,"id">[]>` for pages `home`, `sector:real-estate`, `sector:manufacturing`, `sector:trading`, `sector:hospitality`, `sector:retail`, `sector:logistics`, `sector:professional-services`, `erp:falcon`, `erp:odoo`, `product:server-management`, `product:data-management`, `product:applications`, `about`, `contact`, `demo`, `faq`, `privacy-policy`, `terms`.
  - `seedPageBlocks(pool)`: inserts `SEED[page]` only for pages with zero rows. One-off fixes guarded by a `data_fixes(key text pk)` table: `v2-disable-applications-brochure`, `v2-sector-slugs` (keep the existing slugs `real-estate`, `manufacturing`, `trading`, `hospitality`, `retail`, `logistics`, `professional-services`; update their v2 names (Real estate and construction, Manufacturing, Trading and distribution, Restaurants and hospitality, Retail and e-commerce, Logistics and fleet, Services and professional), photos and promises; disable `RetailBasic`, `construction` and every other sector, keep rows), `v2-disable-demo-testimonials`.
- Seed copy: real estate in EN and AR from the approved mockup (lifecycle, roles, pains, fit, plan, FAQ); home from the approved home artboard; the other sectors written in the same structure and voice (EN and AR), each with roles that fit the sector (manufacturing: owner, plant manager, finance; trading: owner, sales manager, warehouse; hospitality: owner, branch manager, kitchen; retail: owner, store manager, e-commerce; logistics: owner, fleet manager, finance; professional-services: partner, project manager, finance). Phase durations seeded as typical ranges (Assess 1 day, Blueprint 1 to 2 weeks, Build 4 to 8 weeks, Train 1 to 2 weeks). Quote blocks seeded with `enabled: false`.

- [ ] **Step 1:** Write DB tests: running `ensureReady()` twice leaves exactly one set of seed rows per page; a page edited via `savePageBlocks` is not reseeded after another `ensureReady()`; `savePageBlocks` with one invalid block throws and leaves the previous rows intact; `getPageBlocks("home")` with the pool pointed at a closed port returns `SEED.home` (enabled only); every `SEED` entry passes `parseBlock`; after the data fix, sector `RetailBasic` is `enabled=false` and brochure `applications` is `enabled=false`.
- [ ] **Step 2:** Run `npm run test:db` (FAIL).
- [ ] **Step 3:** Implement DDL, store, seeds and data fixes.
- [ ] **Step 4:** Run `npm run test:db` and `npm run test` (PASS); commit `feat(db): page_blocks, page_seo, v2 seeds and data fixes`.

### Task 4: Design tokens, fonts and UI primitives

**Files:**
- Modify: `src/app/globals.css` (`@theme` tokens, keyframes `rise`, `swap`, `settle`, reduced-motion block), `src/app/[locale]/layout.tsx` (fonts)
- Create: `src/components/v2/ui/{button.tsx,bezel.tsx,section.tsx,container.tsx,icon.tsx,bi-text.tsx}`
- Test: `tests/e2e/tokens.spec.ts`

**Interfaces:**
- Produces: `<Button href variant="primary"|"ghost"|"link" withArrow>`; `<Bezel radius={32|26}>` (outer 8px tinted shell, inner radius minus 7); `<Section tone="page"|"surface"|"brand" id>`; `<Container>` (max-width 1200, inline padding 120 desktop, 20 mobile); `<Icon name>` wrapping Phosphor Light with RTL flip for directional icons; `<BiText value={Bi} />` (server, uses `pickBi` and the request locale).

- [ ] **Step 1:** e2e test: on `/` the computed `font-family` of `body` starts with the Schibsted Grotesk next/font family; on `/ar` it starts with the Alexandria family; with `reducedMotion: "reduce"` the hero heading has `animation-name: none`.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(ui): v2 tokens, fonts and primitives`.

### Task 5: Layout chrome (navbar, footer, WhatsApp, mobile bar)

**Files:**
- Modify: `src/app/[locale]/layout.tsx`, `src/components/layout/{navbar,footer,whatsapp-widget,mobile-bottom-bar,language-toggle}.tsx`, `src/components/providers/settings-provider.tsx`
- Create: `src/lib/public-settings.ts`
- Test: `tests/e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: Task 4 primitives; `getSettings`, `getFooterLinks`, `getProducts`, `getSectors`.
- Produces: `getPublicSettings(): Promise<PublicSettings>` (server); the provider receives it as `initial` so SSR HTML already contains footer links, products and sectors; geo-based WhatsApp routing stays client-side.
- Footer hides any phone equal to `""` or `+201000000000` and any branch without a phone and address; shows CR `7049432656` and VAT `311410985900003` from settings (seed them into `site_settings` via new columns `cr_number`, `vat_number`).

- [ ] **Step 1:** e2e tests, fetching raw HTML with JavaScript disabled: footer contains at least one link in each column; HTML does not contain `+201000000000`; nav is one line at 1024px (navbar height at most 72px); mobile sheet opens and traps focus; language toggle on `/sectors/real-estate` goes to `/ar/sectors/real-estate`.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(layout): v2 chrome with server-rendered footer`.

### Task 6: SEO infrastructure

**Files:**
- Create: `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/v2/json-ld.tsx`
- Modify: `src/app/[locale]/layout.tsx` (`metadataBase`, remove hardcoded `alternates`), `next.config.ts` (none yet)
- Test: `tests/unit/seo.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Produces: `SITE_URL` (from `NEXT_PUBLIC_SITE_URL`, default `https://falcon-it.sa`); `localizedPath(path: string, locale: "en"|"ar"): string` (`/x` for en, `/ar/x` for ar, `/` and `/ar` for home); `alternatesFor(path): { canonical: string; languages: { en: string; ar: string; "x-default": string } }`; `buildMetadata({ page, path, locale, fallbackTitle: Bi, fallbackDescription: Bi }): Promise<Metadata>` (reads `getPageSeo`, then global SEO); `<JsonLd data />`; helpers `organizationLd()`, `faqLd(faqs)`, `breadcrumbLd(items)`.

- [ ] **Step 1:** Unit tests: `localizedPath("/sectors/real-estate","ar") === "/ar/sectors/real-estate"`; `localizedPath("/","en") === "/"`; `alternatesFor("/demo").languages["x-default"] === "https://falcon-it.sa/demo"`; sitemap excludes `/blog` when `blog_enabled=false` and includes every enabled sector in both locales; robots disallows `/admin`, `/setup`, `/api`.
- [ ] **Step 2:** e2e: `/robots.txt` and `/sitemap.xml` return 200; on `/` and `/ar/sectors/real-estate` the `og:image` content starts with `https://falcon-it.sa/`; each page has exactly one canonical link and an `x-default` alternate; titles of `/`, `/demo`, `/sectors/real-estate` are all different.
- [ ] **Step 3:** Run (FAIL), implement, run (PASS), commit `feat(seo): metadata, canonical, hreflang, sitemap, robots, json-ld`.

### Task 7: Block renderer and shared section components

**Files:**
- Create: `src/components/v2/blocks/index.tsx` (`BlockRenderer`), one component per block type under `src/components/v2/blocks/`, `src/components/v2/islands/{hero-sector-switcher,role-provider,role-switcher,accordion}.tsx`
- Test: `tests/e2e/blocks.spec.ts` (against a test-only route `src/app/[locale]/__blocks/page.tsx` that renders every `SEED` block, excluded from sitemap and returning 404 when `NODE_ENV=production`)

**Interfaces:**
- Consumes: Task 2 `Block`, Task 4 primitives.
- Produces: `<BlockRenderer blocks={Block[]} locale context={{ sector?: Sector }} />`; `RoleProvider` (context `{ role: string; setRole(id) }`, default the first role); `HeroSectorSwitcher` (no sector selected by default; selecting the active sector clears it; changes subtitle and card only, never the H1).

- [ ] **Step 1:** e2e tests on `/__blocks` and `/ar/__blocks`: every block renders a heading or `aria-label`; no element contains the text `undefined`; clicking a role pill sets `aria-checked="true"` on it and lit stages change; a block seeded with a 140-character title and a 12-item list causes no horizontal scroll at 390 and 1440 (`document.documentElement.scrollWidth <= window.innerWidth`); with Arabic copy blanked in a fixture block the English text renders.
- [ ] **Step 2:** Run (FAIL), implement the renderers to match the mockups pixel-for-pixel within reason, run (PASS), commit `feat(blocks): v2 renderers and interactive islands`.

### Task 8: Home page

**Files:**
- Modify: `src/app/[locale]/page.tsx` (replace with `getPageBlocks("home")` + `BlockRenderer`, `generateMetadata` via `buildMetadata`)
- Delete: home-only legacy sections no longer imported (`hero`, `why-erp-fails`, `why-choose-falcon`, `product-trio`, `sectors-home`, `cta-banner`, `stats-counter`, `newsletter` if unused elsewhere)
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1:** e2e: H1 is `One ERP for your whole company.` (EN) and the AR seed H1 on `/ar`; no sector pill is `aria-checked="true"` on load; the sector grid has exactly 6 photo cards plus Services and "Don't see your sector"; every primary CTA has text `Book a demo` and `href` equal to `site_settings.demo_url` (seed `/demo`); Falcon card shows the image with `alt="Falcon ERP"`.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(home): v2 home from blocks`.

### Task 9: Sector pages

**Files:**
- Modify: `src/app/[locale]/sectors/page.tsx`, `src/app/[locale]/sectors/[slug]/page.tsx`, `next.config.ts` (`redirects()`, permanent, in both locales: `/sectors/RetailBasic` to `/sectors/retail`, `/sectors/construction` to `/sectors/real-estate`, `/sectors/food-beverage` to `/sectors/hospitality`, every other disabled seed slug (healthcare, education, automotive, pharma, agriculture, energy, fashion, jewelry, nonprofit) to `/sectors`)
- Test: `tests/e2e/sectors.spec.ts`

- [ ] **Step 1:** e2e: each of the seven sectors returns 200 in EN and AR with a role switcher; on `/ar/sectors/real-estate` choosing `مقاول` lights exactly stages 2, 3 and 6 and changes the H1 to the contractor promise; `/sectors/RetailBasic` returns 301 to `/sectors/retail` and `/ar/sectors/construction` 301 to `/ar/sectors/real-estate`; an unknown slug returns 404; the booking CTA href includes `?sector=real-estate&role=dev` after choosing developer.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(sectors): v2 lifecycle template for every sector`.

### Task 10: ERP and product pages

**Files:**
- Create: `src/app/[locale]/erp/[system]/page.tsx` (`falcon`, `odoo`)
- Modify: `src/app/[locale]/products/[slug]/page.tsx` (blocks `product:<slug>`), `src/app/[locale]/products/page.tsx` (index of ERP plus supporting services), `next.config.ts` redirects (`/products/falcon-erp-desktop` and `/products/falcon-cloud` to `/erp/falcon`, `/products/odoo-services` to `/erp/odoo`, permanent)
- Delete: `src/app/[locale]/products/{falcon-cloud,falcon-erp-desktop,odoo-services}/`, `src/lib/product-content.ts` once seeds hold its copy
- Test: `tests/e2e/erp.spec.ts`

- [ ] **Step 1:** e2e: `/erp/falcon` and `/erp/odoo` return 200 in both locales with the official logo; the three old URLs 301 to the new ones; `/products/server-management` renders on the v2 template; `/brochure/applications` returns 404 and no page links to it.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(erp): v2 ERP and product pages with redirects`.

### Task 11: Remaining pages and lead attribution

**Files:**
- Modify: `src/app/[locale]/{about,contact,demo,faq,clients,terms,blog,privacy}/page.tsx`, `src/components/forms/*` (restyle only), `src/app/api/leads/demo/route.ts` (store `sector` and `role` from the request body into `leads.data`)
- Create: `src/app/[locale]/privacy-policy/page.tsx` (blocks `privacy-policy`)
- Test: `tests/e2e/pages.spec.ts`, `tests/unit/demo-lead.test.ts`

- [ ] **Step 1:** Tests: `/demo?sector=retail&role=owner` pre-fills the sector select with Retail; submitting the demo form (Odoo and Resend disabled in test settings) creates a lead whose `data.sector === "retail"` and `data.role === "owner"` and fires no network call to Odoo; `/privacy` still renders the Falcon Valley app policy unchanged; `/privacy-policy` renders the website policy and every form links to it; `/blog` returns 404 and is absent from nav, footer and sitemap while `blog_enabled=false`, and renders with fixed image paths when enabled; about, contact, faq, clients and terms render in both locales with v2 chrome and unique titles.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(pages): v2 remaining pages, privacy-policy, lead attribution`.

### Task 12: Admin, Pages editor and settings

**Files:**
- Create: `src/app/admin/(dashboard)/pages/page.tsx`, `src/app/admin/(dashboard)/pages/[page]/page.tsx`, `src/components/admin/block-form/{index,field-bi,field-list,field-image,field-link}.tsx`, `src/app/api/admin/pages/route.ts`, `src/app/api/admin/pages/[page]/route.ts`, `src/app/api/admin/page-seo/route.ts`
- Modify: `src/components/admin/sidebar.tsx` (add Pages, hide Pricing), sectors admin (photo, short promise, "Edit landing page" link to `/admin/pages/sector:<slug>`), settings admin (blog toggle, CTA labels, CR, VAT)
- Test: `tests/db/admin-pages-api.test.ts`

**Interfaces:**
- Consumes: Task 3 store functions, Task 2 `BLOCKS` and `parseBlock`.
- Produces: `GET /api/admin/pages` → `listPages()`; `GET /api/admin/pages/[page]` → `getPageBlocksAdmin`; `PUT /api/admin/pages/[page]` body `{ blocks: Block[] }` → 400 `{ error: "<path>: <message>" }` on the first invalid block, else `savePageBlocks`; `GET|PUT /api/admin/page-seo?page=`. All return 401 without the admin session. The form generator walks the block Zod schema: `Bi` → two side-by-side inputs (AR `dir="rtl"`), arrays → add/remove/move, image paths → existing upload widget, `roles` arrays in stages → checkboxes of the block's role ids.

- [ ] **Step 1:** Tests: unauthenticated `PUT` returns 401; `PUT` with one invalid block returns 400 and `GET` afterwards returns the previous blocks; a valid `PUT` that blanks one Arabic field round-trips and the public page then shows the English text for that field; reordering two blocks persists the new `sort_order`.
- [ ] **Step 2:** Run (FAIL), implement, run (PASS), commit `feat(admin): pages block editor, page seo, settings fields`.

### Task 13: Cleanup, full QA and owner review

**Files:**
- Delete: orphaned components (`compliance-badges`, `feature-showcase`, `pain-points`, `tco-comparison`, legacy home sections), old tokens (`cta`, `gold`, `saudi-green`) after `grep` shows no use, unused message namespaces
- Create: `tests/e2e/screens.spec.ts` (full-page screenshots of every public route, EN and AR, desktop and mobile, into `qa/screens/`), `qa/lighthouse.md`

- [ ] **Step 1:** Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:db`, `npm run build`, `npm run e2e` (all PASS).
- [ ] **Step 2:** Stop the local Postgres and load `/`, `/ar`, `/sectors/real-estate`, `/erp/falcon`, `/demo`: all 200 with seed content (DB-down fallback).
- [ ] **Step 3:** Grep built HTML of every route for `—`, `–`, `undefined`, `+201000000000`, `localhost`: zero hits.
- [ ] **Step 4:** Lighthouse (mobile) on `/` and `/ar/sectors/real-estate`: SEO 100, Accessibility at least 95, Best Practices at least 95; record in `qa/lighthouse.md`.
- [ ] **Step 5:** Commit `chore: remove legacy sections and tokens, add qa screenshots`, then send the owner a contact sheet of `qa/screens/` and the list of seeded placeholders (phase durations) for approval. **Do not start Task 14 without the owner's explicit approval.**

### Task 14: Production deploy and merge

**Files:**
- Create: `docs/runbooks/2026-10-website-v2-deploy.md` (filled in during the deploy with timestamps and outputs)

Server: `root@45.159.230.187` via `~/.ssh/claude_falcon_web`. Compose project `falcon-it`, service `app`, container `falcon-app`, DB container `falcon-db` (db `falcon`, user `falcon`), compose file under Portainer stack 16. Shared host: never stop, prune or recreate any other container.

- [ ] **Step 1: Preflight.** Confirm `falcon-app` runs `falconweb:eb827f8` and `origin/main` is still `eb827f8` plus only this branch's commits ahead (deploy source must be a superset of live). Confirm disk space for a build.
- [ ] **Step 2: Backup on the server.** `docker exec falcon-db pg_dump -U falcon -d falcon -Fc > /root/backups/falcon-<ts>.dump` (stays on the server); tag the current image `falconweb:rollback-eb827f8-<ts>`.
- [ ] **Step 3: Build.** Sync the branch tree (excluding `node_modules`, `.next`, `qa/`, `tests/`) to `/root/builds/falcon-it-<commit>/`, run `docker build -t falconweb:<commit> -t falconweb:latest --build-arg NEXT_PUBLIC_SITE_URL=https://falcon-it.sa .` with the same `NEXT_PUBLIC_WHATSAPP_NUMBER` build arg as the running image.
- [ ] **Step 4: Release.** Recreate only service `app` of project `falcon-it` with `docker compose -p falcon-it -f <stack compose> up -d --no-deps app`. Wait for healthy.
- [ ] **Step 5: Smoke.** `curl` 200 on `/`, `/ar`, all seven `/sectors/*`, `/erp/falcon`, `/erp/odoo`, `/demo`, `/privacy`, `/privacy-policy`, `/sitemap.xml`, `/robots.txt`, `/api/settings/public`, `/admin/login`; 301 on `/products/odoo-services`; app logs show the migrations and seeds ran once with no errors; submit one real demo booking marked `TEST v2 deploy` and confirm the lead in admin and Odoo, then delete it.
- [ ] **Step 6: Rollback (only if Step 5 fails).** Retag `falconweb:rollback-eb827f8-<ts>` as `latest`, recreate `app`, re-run smoke. Restore the dump only if data was damaged.
- [ ] **Step 7: Merge.** Immediately after a good smoke test: merge `feat/website-v2` into `main`, push, and record the deployed commit in the runbook.
