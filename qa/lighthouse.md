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

Same build, devtools throttling (applied throttling; still a lab measurement):

| Page | Performance | LCP | FCP | TBT | Speed Index |
|---|---|---|---|---|---|
| `/` | 92 | 2.9 s | 2.1 s | 80 ms | 2.2 s |
| `/ar/sectors/real-estate` | 89 | 3.2 s | 2.2 s | 190 ms | 2.3 s |

HTML reports of the first "after" runs: `qa/screens/lighthouse/` (gitignored, local only).

## Notes

- Third-party trackers are now off in the local test database (`scripts/prepare-test-env.mjs` sets `snapchat_enabled` and `google_enabled` to false; production defaults and the tracking code are unchanged), so local dev, e2e and QA runs no longer call Snapchat or Google. The "before" run above was taken before that change and did load the Snap Pixel.
- **Production: Best Practices will be 79 while the Snap Pixel is enabled.** The pixel (`sc-static.net`, `tr.snapchat.com`, and the `pixel.tapad.com` sync it triggers) sets third-party cookies, which fails `third-party-cookies` and logs cookie issues in DevTools (`inspector-issues`). The site's own code scores 100.
- The devtools-throttling figures are a lab measurement too (applied throttling on this machine), not field data from real visitors.
- SEO 100 and Accessibility 100 on both pages. Best Practices is 100 for the site's own code. **With the Snap Pixel on, Best Practices drops to 79** (third-party cookies). Tracking is out of scope for this rebuild (global constraint), so this is an owner decision: keep the pixel as is, or load it only after cookie consent.
- Simulated LCP (about 6 s) is attributed to the "Book a demo" text in the mobile bottom bar. The hero heading and photo start their entrance animation at opacity 0, and Chrome does not count opacity-0 paints as LCP, so the bar is the largest counted text. Observed in the trace, LCP equals FCP (176 ms unthrottled); the simulated figure then waits for the JavaScript chunks. Options for later: start the `rise` entrance at a small non-zero opacity, or trim client JavaScript (Lighthouse reports about 76 KiB unused JS).
- Remaining image savings need responsive images: `next.config.ts` had `images.unoptimized: true` since the first commit, so every photo shipped at 1400 px wide even on phones. Done in Task 13b, see below.

## Task 13b: image optimizer on (2026-10-04)

Change: `images.unoptimized` removed, `localPatterns` limited to `/images/**` and `/api/uploads/**`, every v2 photo and screenshot rendered with a layout-matched `sizes`, so phones receive a 640 to 828 px WebP instead of the 1400 px JPEG. The Docker runner checks that `sharp` loads.

Same method as above: local production build with `NEXT_PUBLIC_SITE_URL=http://localhost:3200`, `next start -p 3200`, local test database (trackers off), Lighthouse 12.8.2 mobile with the tracker hosts blocked, simulated throttling, three runs per page. "Before" is commit d9fa67e (optimizer off), measured again today on this machine; "after" is the Task 13b code, after one warm-up run so the optimizer cache is filled as it will be after the first visitors.

| Page | | Performance (3 runs) | Accessibility | Best Practices | SEO | LCP | FCP | TBT | CLS | Page weight | Images |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | before | 78 / 78 / 78 | 100 | 100 | 100 | 6.1 s | 1.2 s | 30 to 40 ms | 0 | 1,528 KiB | 929 KiB (16 requests) |
| `/` | after | 80 / 79 / 79 | 100 | 100 | 100 | 5.5 to 5.7 s | 1.2 s | 10 to 40 ms | 0 | 933 KiB | 331 KiB (16 requests) |
| `/ar/sectors/real-estate` | before | 79 / 80 / 79 | 100 | 100 | 100 | 5.3 to 5.7 s | 1.5 s | 30 to 40 ms | 0 | 809 KiB | 180 KiB (11 requests) |
| `/ar/sectors/real-estate` | after | 79 / 79 / 81 | 100 | 100 | 100 | 5.2 to 5.5 s | 1.5 s | 30 to 40 ms | 0 | 716 KiB | 84 KiB (11 requests) |

- Images on the home page drop from 929 KiB to 331 KiB (about 64 percent less); on the Arabic real estate page from 180 KiB to 84 KiB. CLS stays 0 (every image keeps its width and height).
- "Properly size images" falls from 758 KiB to 118 KiB on `/` and from 129 KiB to 15 KiB on the sector page. What remains is the cropped part of photos shown with `object-cover` in fixed-height frames.
- The Performance score moves little because simulated LCP is still the "Book a demo" text in the mobile bottom bar, held back by the JavaScript chunks (about 272 KiB of script), as described above. The image change mainly saves mobile data and download time on real connections.
- The cookie banner does not appear in these runs: Snap is off in the test database, and the banner only shows while Snap is enabled. In production, with Snap enabled, Best Practices should no longer drop to 79 before consent, because the Snap Pixel (and its third-party cookies) loads only after Accept; not measured here.
