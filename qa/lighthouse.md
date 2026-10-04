# Lighthouse (mobile), Task 13

Tool: Lighthouse 12.8.2 (`npx lighthouse@12`), headless Chrome, mobile form factor, categories performance, accessibility, best-practices, seo. Target: the local production build (`next build` then `next start -p 3200`) against the local test database. Date: 2026-10-04.

Targets: SEO 100, Accessibility at least 95, Best Practices at least 95.

## Before (code as of db835e4, before the image work)

Default build, so the canonical and hreflang URLs point at `https://falcon-it.sa` while the page is served from `localhost`. Snap Pixel loaded (it is enabled in the shipped integration defaults).

| Page | Performance | Accessibility | Best Practices | SEO | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 78 | 100 | 79 | 92 | 6.1 s | 1.4 s | 20 ms | 0 |
| `/ar/sectors/real-estate` | 79 | 100 | 79 | 92 | 5.6 s | 1.5 s | 20 ms | 0 |

Failing audits:
- SEO `canonical`: "points to another hreflang location". A lab artefact: the canonical is `https://falcon-it.sa/...` and the page was loaded from `http://localhost:3200`. On the live domain the canonical equals the page URL.
- Best Practices `third-party-cookies` (5 cookies) and `inspector-issues` (cookie issues): all from the Snap Pixel (`sc-static.net`, `tr.snapchat.com`, `pixel.tapad.com`).

## After

Changes: v2 images recompressed in place (2.5 MB to 1.4 MB, same paths), client message payload cut to 5 namespaces. To measure the site itself, the build used `NEXT_PUBLIC_SITE_URL=http://localhost:3200` (so the canonical matches the tested origin, as it will on falcon-it.sa) and Lighthouse blocked the tracker hosts (`*snapchat.com*`, `*sc-static.net*`, `*tapad.com*`, `*googletagmanager.com*`). Three runs per page, simulated throttling (Lighthouse default):

| Page | Performance (3 runs) | Accessibility | Best Practices | SEO | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 78 / 77 / 77 | 100 | 100 | 100 | 6.1 to 6.3 s | 1.4 s | 20 ms | 0 |
| `/ar/sectors/real-estate` | 79 / 79 / 78 | 100 | 100 | 100 | 5.6 to 5.9 s | 1.5 s | 30 ms | 0 |

Same build, devtools throttling (applied throttling, closer to a real slow 4G phone):

| Page | Performance | LCP | FCP | TBT | Speed Index |
|---|---|---|---|---|---|
| `/` | 92 | 2.9 s | 2.1 s | 80 ms | 2.2 s |
| `/ar/sectors/real-estate` | 89 | 3.2 s | 2.2 s | 190 ms | 2.3 s |

HTML reports of the first "after" runs: `qa/screens/lighthouse/` (gitignored, local only).

## Notes

- SEO 100 and Accessibility 100 on both pages. Best Practices is 100 for the site's own code. **With the Snap Pixel on, Best Practices drops to 79** (third-party cookies). Tracking is out of scope for this rebuild (global constraint), so this is an owner decision: keep the pixel as is, or load it only after cookie consent.
- Simulated LCP (about 6 s) is attributed to the "Book a demo" text in the mobile bottom bar. The hero heading and photo start their entrance animation at opacity 0, and Chrome does not count opacity-0 paints as LCP, so the bar is the largest counted text. Observed in the trace, LCP equals FCP (176 ms unthrottled); the simulated figure then waits for the JavaScript chunks. Options for later: start the `rise` entrance at a small non-zero opacity, or trim client JavaScript (Lighthouse reports about 76 KiB unused JS).
- Remaining image savings need responsive images: `next.config.ts` has `images.unoptimized: true` since the first commit, so every photo ships at 1400 px wide even on phones (Lighthouse: about 1.3 MB of "properly size images" savings before recompression). Turning the Next image optimizer on needs `sharp` in the Docker image and a writable `.next/cache`; it is a deploy change, so it was not made here.
