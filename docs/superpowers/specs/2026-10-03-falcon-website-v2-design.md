# Falcon website v2: design spec

Date: 2026-10-03
Branch: `feat/website-v2` (from `origin/main` @ `eb827f8`, which is what runs in production today)
Approved mockups: https://claude.ai/artifact/V6NHF8qBvqLyVU9SBVGc3G (home EN, real-estate lifecycle AR, real-estate mobile EN)
Product context: `PRODUCT.md` (register: brand; expert, confident, direct; Odoo.com-like clarity in Falcon blue)

## 1. Goal

Rebuild every public page of falcon-it.sa in the v2 design, so the site sells Falcon's ERP (Odoo and Falcon ERP) and its implementation team, with no prices, a sector landing page for every sector, and every word and image editable from the existing admin CMS. Fix the SEO and broken-content defects found in the 2026-09-29 audit. Ship directly to production with a tested rollback.

Success means:
- All public routes render the v2 design in EN and AR (RTL designed, not mirrored), desktop and mobile.
- A non-developer can change any headline, paragraph, list item, image, CTA label or sector stage from admin, in both languages, without a deploy.
- Lead capture keeps working end to end (DB lead, Odoo CRM lead, calendar event, Resend emails, Ads conversions).
- Lighthouse SEO 100 and Accessibility at least 95 on home and one sector page; valid sitemap, robots, canonical, hreflang, OG image.

## 2. Decisions taken with the owner

| Topic | Decision |
|---|---|
| Scope | Whole public site in one release |
| Content | Everything admin-editable (EN and AR) |
| Deploy | Directly to production, with pre-deploy DB backup and a tagged rollback image |
| Extra fixes | SEO and broken content (security fixes deferred to a later release) |
| Pricing | None on the public site (already true since `eb827f8`) |
| Primary CTA | "Book a demo" / "احجز عرضًا تجريبيًا" everywhere, pointing to `/demo` |

## 3. Design system (from the approved mockups)

- **Type:** Schibsted Grotesk (Latin) and Alexandria (Arabic) via `next/font/google`. Fix the current bug where `@theme` hardcodes font names instead of the `next/font` CSS variables.
- **Colour:** page `#F5F7FA`, surface `#FFFFFF`, ink `#0B1A33`, body `#3A4860`, muted `#5B6880`, brand `#1466C2`, brand-deep `#0D4F9E`, sky tint `#E4F0FB`, Odoo tint `#F6F1F5`. One accent only. The committed brand-blue block is used once per page (the booking section).
- **Shape:** pill buttons with nested arrow circle; double-bezel frames for media (outer 8px tinted shell, inner radius 22 to 25); cards 22 to 26; inputs 12.
- **Icons:** Phosphor Light (`@phosphor-icons/react`), one family.
- **Motion:** one hero entrance (rise and blur, 720ms, staggered), interaction feedback only (pill press, card lift, state swaps of 260 to 320ms). Everything disabled under `prefers-reduced-motion`. No scroll-reveal on every section.
- **Bans:** no eyebrow above every section, no em dashes, no identical icon-card grids, no div-built fake screenshots, no invented numbers or claims.
- **Imagery:** real Falcon product screenshots plus the Higgsfield editorial photo set (blue hour, no faces) already generated: real estate, manufacturing, distribution, restaurants, retail, logistics, hero laptop, hero office. Shipped as seeded uploads so they are replaceable from admin.

Tokens live in `src/app/globals.css` `@theme`. Old tokens (cta green, gold, saudi-green) are removed after all pages migrate.

## 4. Information architecture

| Route | v2 content |
|---|---|
| `/` | ERP-first home: hero ("One ERP for your whole company", optional sector switcher), client logos, "One system. Every department.", equal sector grid, "An ERP is only as good as its setup", two-ERP comparison, process, client quote, booking block |
| `/sectors` | Sector index (equal photo grid) |
| `/sectors/[slug]` | **One template for every sector**: role switcher, role-specific hero promise, lifecycle stages lit per role, role summary, pains per role, Odoo vs Falcon fit, plan, case and FAQ, booking block |
| `/erp/falcon` (new) and `/erp/odoo` (new) | Product pages for Falcon ERP (Desktop, Cloud, hybrid) and Odoo services, same block system. Old URLs `/products/falcon-erp-desktop`, `/products/falcon-cloud`, `/products/odoo-services` 301 to the new ones |
| `/products/[slug]` | Kept for custom products (server management, data management, applications) on the new template |
| `/clients` | Logo wall plus filters, v2 styling |
| `/about`, `/contact`, `/demo`, `/faq`, `/terms` | Restyled; demo keeps the calendar booking flow |
| `/privacy` | **Website** privacy policy (new, admin-editable). The Falcon Valley app policy moves to `/apps/falcon-valley/privacy` (see open question 1) |
| `/blog` | Hidden from nav, footer and sitemap until real posts exist (admin toggle); broken image paths fixed |
| `/brochure/[slug]` | Kept; `/brochure/applications` content replaced (open question 2) |

Sector list seeded: Real estate and construction, Manufacturing, Trading and distribution, Restaurants and hospitality, Retail and e-commerce, Logistics and fleet, Services and professional. Existing sector rows keep their slugs; the old `RetailBasic` and duplicates are disabled, not deleted, and their URLs 301 to the nearest sector.

## 5. Content model (CMS)

Existing typed tables stay and keep their admin screens: `site_settings`, `seo_settings`, `branches`, `footer_links`, `clients`, `client_tags`, `testimonials`, `faqs`, `products`, `product_brochures`, `sectors`, `integrations`, `leads`.

New content needs a structure that covers many section types without a table per section. Approach chosen:

### 5.1 `page_blocks` (new table)

| column | type | notes |
|---|---|---|
| id | uuid | |
| page | text | `home`, `sector:<slug>`, `erp:falcon`, `erp:odoo`, `about`, `contact`, `demo`, `privacy`, ... |
| type | text | block type, e.g. `hero`, `logo_wall`, `departments`, `sector_grid`, `setup_list`, `erp_compare`, `process`, `quote`, `booking`, `lifecycle`, `role_pains`, `fit`, `plan`, `faq_ref`, `rich_text` |
| sort_order | int | |
| enabled | bool | |
| content | jsonb | typed per block type; every user-facing string is `{ "en": "...", "ar": "..." }`, images are upload paths |
| updated_at | timestamptz | |

- Each block type has a **Zod schema** in `src/lib/blocks/<type>.ts` (one source of truth) used for: validating admin saves, typing the React renderer, and generating the admin form.
- The admin **Pages** editor lists pages, shows blocks in order (reorder, enable, disable), and renders a form from the block schema: bilingual text fields side by side (AR field `dir="rtl"`), lists with add, remove and reorder, image fields using the existing upload API, and link fields.
- Role-aware content (sector pages) lives inside the block JSON: `roles[]` (id, label), `stages[]` (title, description, modules, `roles[]`), `pains` keyed by role, `promise` keyed by role, `summary` keyed by role.
- Seeding: `seedPageBlocks()` in `migrate.ts` inserts the v2 copy for a page only when that page has no blocks, so production gets the new content on first boot and later admin edits are never overwritten.
- Reads go through `getPageBlocks(page)` in `data-store.ts`, with the seed content as fallback when the DB is unreachable (same pattern as today).

### 5.2 Changes to existing tables

- `sectors`: add `slug` uniqueness check, `photo` (upload path), `short_promise_en/ar`. The landing body comes from `page_blocks` with `page = 'sector:<slug>'`.
- `seo_settings`: add per-page rows: new table `page_seo(page, title_en/ar, description_en/ar, og_image)`; the global row stays the fallback.
- `site_settings`: add `blog_enabled bool default false`, `cta_label_en/ar` (global primary CTA label), `demo_url`.
- Copy that is inline in components today (`page.tsx` overrides, `isArabic ?` strings, `PRODUCT_CONTENT`, the three 480-line product pages) moves into seeded blocks. `messages/*.json` keeps only UI chrome (form labels, validation errors, aria labels).

## 6. Components

- `src/components/v2/` holds the new section components, one per block type, each server-rendered with a small client island only where interaction exists: `HeroSectorSwitcher`, `RoleSwitcher` (shared role state for hero, lifecycle, pains and summary through a context), `Accordion` (mobile FAQ).
- Layout chrome replaced: island navbar (pill, blur, single line, mobile sheet), footer (three columns from `footer_links` rendered **server-side** so SSR never shows empty columns), WhatsApp widget and mobile bottom bar restyled to the pill pattern.
- RTL: logical CSS properties (`ps-`, `pe-`, `start`, `end`) throughout; arrow icons flip with `rtl:scale-x-[-1]`.
- Images: `next/image` with `unoptimized` kept (standalone, uploads served by API), explicit width and height, `loading="lazy"` below the fold, `priority` on the hero.

## 7. SEO and broken-content fixes

1. `metadataBase` from `NEXT_PUBLIC_SITE_URL`; absolute OG and Twitter images.
2. `generateMetadata` on every route from `page_seo`, falling back to block content.
3. Canonical per route; `alternates.languages` per route with correct `as-needed` URLs and `x-default`.
4. `src/app/sitemap.ts` (enabled sectors, products, pages; blog only when enabled) and `src/app/robots.ts` (disallow `/admin`, `/setup`, `/api`).
5. JSON-LD: Organization, LocalBusiness per branch, FAQPage on pages with FAQs, BreadcrumbList on sector and product pages.
6. Stats and counters render the real value on the server; animation only enhances.
7. Footer and nav rendered with server data; the client provider only adds geo-based WhatsApp routing.
8. Egypt phone: no public placeholder; a phone or branch with an empty or `+201000000000` value is not rendered.
9. Blog: hidden by default; image paths fixed; post dates formatted per locale.
10. `/products/[slug]` title and description per product; brochure titles fixed.

## 8. Leads, tracking, integrations

Unchanged behaviour, restyled UI: `/demo` (calendar, `POST /api/leads/demo`), `/contact`, newsletter (only if the block is enabled). Every "Book a demo" CTA links to `/demo`, carrying `?sector=<slug>&role=<role>` so the lead records which page and role converted. GTM, GA4, Ads conversions (`fireAdsConversion`) and Snap pixel stay wired in the locale layout.

## 9. Admin

- New **Pages** module (block editor, section 5.1) and **Page SEO** tab.
- **Sectors** module gains photo upload, short promise and an "Edit landing page" link into the block editor.
- **Settings** gains blog toggle and global CTA label.
- Pricing module hidden from the sidebar (data kept).
- Admin stays on its current styling; only new screens are added.

## 10. Migration and deploy

1. **Code:** work on `feat/website-v2` in `D:\Projects\falcon-it.sa-redesign`. The `falcon-it.sa-live` worktree belongs to another session and is not touched.
2. **Local verification:** run against a local Postgres (Docker) with the seeds; `next build`, `tsc --noEmit`, ESLint (replace the removed `next lint` script), headless screenshots of every route in EN and AR at 1440 and 390, Lighthouse on home and one sector page, a demo booking end to end with Odoo and Resend pointed at test settings.
3. **Owner review gate:** screenshots of every page sent for approval before deploy.
4. **Production deploy** (server 45.159.230.187, compose project `falcon-it`, container `falcon-app`, port 3001):
   - `pg_dump` of the `falcon` DB kept on the server, timestamped.
   - Tag the running image `rollback-eb827f8-<date>`.
   - Build `falconweb:<commit>` and `falconweb:latest` from the branch commit, the same way the `eb827f8` image was built.
   - Recreate `falcon-app` only. No other container on this shared host is touched; no `docker system prune`.
   - First boot runs the idempotent migrations and seeds `page_blocks` and new columns.
   - Smoke test: `/`, `/ar`, every sector, `/demo`, `/sitemap.xml`, `/robots.txt`, `/api/settings/public`, admin login page; healthcheck green.
   - Rollback: retag `rollback-…` as `latest`, recreate the container, restore the dump if a migration misbehaved (the new migrations only add tables and columns, so restore should not be needed).
5. **Merge rule:** right after a successful deploy, merge `feat/website-v2` into `main` and push, so production never runs code that is not on `main`.

## 11. Out of scope for this release

Security hardening (JWT fallback secret, Postgres password in `portainer-stack.yml`), WhatsApp API messaging, AI features, new blog posts, Egypt-specific pricing pages, an Arabic-first default locale switch.

## 12. Open questions for the owner

1. **Privacy URL:** is `/privacy` linked from the Falcon Valley app store listing? If yes, the safest option is to leave the app policy at `/privacy` and publish the new website policy at `/privacy-policy` (linked from forms and the footer). If no, `/privacy` becomes the website policy and the app policy moves to `/apps/falcon-valley/privacy`.
2. **Applications brochure:** provide the real content, or disable that brochure until it exists?
3. **Egypt office:** real phone number and address, or hide the Egypt office for now?
4. **Claims to confirm before go-live:** free demo session; Fatoora e-invoicing connected in both systems; broker commission calculation; "Arabic-first" for Falcon ERP; client logos all approved for public use.
5. **Placeholders still open:** a real client quote and logo, implementation phase durations, WhatsApp number, CR and VAT numbers.
6. **Product pages:** do Server management, Data management and Applications stay as public products in v2?
