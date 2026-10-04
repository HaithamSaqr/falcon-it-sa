# Runbook: falcon-it.sa website v2 production deploy

Status: DRAFT. Fill in the `<...>` placeholders, timestamps and outputs while deploying. Never paste secrets, passwords, tokens or the contents of `.env` files into this file.

- Server: `root@45.159.230.187` (SSH key `~/.ssh/claude_falcon_web`).
- Compose project `falcon-it`, service `app`, container `falcon-app`. Database container `falcon-db` (db `falcon`, user `falcon`). The compose file lives under Portainer stack 16.
- Shared host: never stop, prune, rebuild or recreate any other container or image. Only service `app` of project `falcon-it` is recreated.
- Currently live: image `falconweb:eb827f8`. Deploy source: branch `feat/website-v2`, commit `<commit>`.

Placeholders used below: `<ts>` (UTC timestamp, e.g. `20261004T0900Z`), `<commit>` (short SHA of the deployed commit), `<stack-compose>` (path of the Portainer stack 16 compose file), `<wa>` (the `NEXT_PUBLIC_WHATSAPP_NUMBER` build arg of the running image), `<image-id>`.

## 0. Before you start

- [ ] Final gates are clean on `<commit>` (lint, typecheck, unit, DB tests, build, full e2e).
- [ ] The owner has approved the deploy window.
- [ ] Deploy source is a superset of what is live (step 1).

## 1. Preflight (read only)

```bash
ssh -i ~/.ssh/claude_falcon_web root@45.159.230.187
docker inspect falcon-app --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}'   # expect falconweb:eb827f8
df -h /var/lib/docker /root                                                                          # room for a build (several GB)
```

On the workstation:

```bash
git fetch origin
git merge-base --is-ancestor eb827f8 <commit> && echo "superset ok"
git log --oneline origin/main..<commit> | wc -l      # only this branch's commits
git log --oneline <commit>..origin/main               # must be empty: nothing on main that the branch lacks
```

Record the public build args of the running image so the new image matches:

```bash
docker inspect falcon-app --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E '^NEXT_PUBLIC_'
```

(`NEXT_PUBLIC_*` values are public build-time values and are safe to note. Do not print the rest of the environment.)

### 1a. Pre-deploy read-only queries

Run these against the live database before anything changes. They are `SELECT` only. Paste the outputs in the deploy log.

```bash
docker exec falcon-db psql -U falcon -d falcon -c "SELECT id, name_en, enabled FROM sectors ORDER BY sort_order;"
```

Expected: the exact slugs `real-estate`, `manufacturing`, `trading`, `hospitality`, `retail`, `logistics`, `professional-services` are present. The migration upserts these by exact, case-sensitive id and disables every other spelling (`RetailBasic`, `construction`, ...). If one of the seven exists only under a different spelling, stop and tell the manager. Save this output: the rollback needs the old ids.

```bash
docker exec falcon-db psql -U falcon -d falcon -c "SELECT to_regclass('page_blocks') AS page_blocks, to_regclass('data_fixes') AS data_fixes;"
```

Expected: both NULL (the v2 tables do not exist yet; the first boot creates them). A non-NULL value means v2 already ran against this database: stop and investigate.

```bash
docker exec falcon-db psql -U falcon -d falcon -c "SELECT id, name, company FROM testimonials ORDER BY sort_order;"
docker exec falcon-db psql -U falcon -d falcon -c "SELECT id, question_en FROM faqs ORDER BY sort_order;"
```

Purpose: spot real, non-default rows an admin entered. The v2 site no longer renders FAQs or testimonials from these tables (the rows are kept). The migration disables only the shipped demo testimonials. If a real client quote or FAQ exists, tell the owner so it can be re-entered in Pages > Home (quote block) or Pages > FAQ after the deploy.

```bash
docker exec falcon-db psql -U falcon -d falcon -c "SELECT id, url FROM footer_links ORDER BY id;"
```

Purpose: note the current footer URLs. The migration changes only `privacy` from `/privacy` to `/privacy-policy`; everything else stays. Keep this output for the rollback step.

## 2. Backup (on the server)

```bash
mkdir -p /root/backups
docker exec falcon-db pg_dump -U falcon -d falcon -Fc > /root/backups/falcon-<ts>.dump
ls -l /root/backups/falcon-<ts>.dump           # non-zero size
docker tag falconweb:eb827f8 falconweb:rollback-eb827f8-<ts>
docker images falconweb --format '{{.Tag}} {{.ID}}'
```

The dump stays on the server. Do not copy it to the workstation or the repository.

## 3. Build from a clean export

Build from `git archive` of the exact commit, never from an rsync of the working tree (a working tree can carry untracked files, a local `data/db-config.json`, `.env.test`, QA output).

On the workstation (`git archive` only reads the commit, so the working tree state does not matter):

```bash
git archive --format=tar --prefix=falcon-it-<commit>/ <commit> | ssh -i ~/.ssh/claude_falcon_web root@45.159.230.187 "mkdir -p /root/builds && tar -x -C /root/builds"
```

On the server:

```bash
cd /root/builds/falcon-it-<commit>
ls -A                                           # no data/, no .env*, no node_modules
docker build -t falconweb:<commit> -t falconweb:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://falcon-it.sa \
  --build-arg NEXT_PUBLIC_WHATSAPP_NUMBER=<wa> .
docker run --rm falconweb:<commit> ls /app                 # server.js, public, .next, data
docker run --rm falconweb:<commit> ls -A /app/data         # must print nothing: no db-config.json inside the image
```

`.dockerignore` keeps `data/`, `.env*.local`, `.env.test`, `qa/`, `tests/`, `playwright-report/`, `test-results/`, `.superpowers/` and `scripts/qa/` out of the build context. The runtime configuration (`/app/data/db-config.json`) comes from the `falcon-data` volume, not from the image.

## 4. Release

```bash
docker compose -p falcon-it -f <stack-compose> up -d --no-deps app
docker ps --filter name=falcon-app --format '{{.Names}} {{.Image}} {{.Status}}'
docker inspect falcon-app --format '{{.State.Health.Status}}'     # wait for healthy
```

Only service `app` is recreated. `falcon-db` and every other container on the host must show an unchanged uptime.

## 5. Post-boot checks

```bash
docker logs falcon-app --since 10m 2>&1 | grep -E '\[migrate\]|\[blocks\]|Error' || echo "no migrate or block errors"
```

Expected: no `[migrate]` error lines (a `data fix ... failed` or `seeding page ... failed` line is a stop). Then the database state:

```bash
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT key FROM data_fixes WHERE key LIKE 'v2-%' ORDER BY key;"
```

Expected: `v2-brochure-copy`, `v2-company-ids`, `v2-disable-applications-brochure`, `v2-disable-demo-testimonials`, `v2-footer-links`, `v2-sector-slugs`, `v2-sector-titles`.

```bash
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT count(*) FROM data_fixes WHERE key LIKE 'page-seeded:%';"              # 19
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT count(DISTINCT page) FROM page_blocks;"                                # 19
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT count(*) FROM sectors WHERE enabled;"                                  # 7
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT slug, enabled FROM product_brochures WHERE slug='applications';"      # applications|f
docker exec falcon-db psql -U falcon -d falcon -At -c "SELECT cr_number, vat_number, blog_enabled, demo_url FROM site_settings WHERE id=1;"
```

Expected for the last query: `7049432656|311410985900003|f|/demo` (a CR or VAT value an admin had already entered is kept; blank ones are filled).

## 6. Smoke test

Use `BASE=https://falcon-it.sa`.

Pages that must be 200 in both locales (no prefix and `/ar`):

```bash
BASE=https://falcon-it.sa
for p in "" /sectors/real-estate /sectors/manufacturing /sectors/trading /sectors/hospitality /sectors/retail /sectors/logistics /sectors/professional-services \
         /sectors /products /erp/falcon /erp/odoo /demo /about /contact /faq /privacy /privacy-policy /terms /clients; do
  for l in "" /ar; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$l$p")" "$l$p"; done
done
for p in /sitemap.xml /robots.txt /api/settings/public /admin/login; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")" "$p"; done
```

Redirects and negative checks (`curl -sI` shows the status and `location`):

| Check | Expected |
| --- | --- |
| `/products/odoo-services` | 308 to `/erp/odoo` |
| `/products/falcon-erp-desktop` and `/products/falcon-cloud` | 308 to `/erp/falcon` |
| `/sectors/RetailBasic` | 308 to `/sectors/retail` |
| `/sectors/healthcare` | 308 to `/sectors` |
| `/ar/sectors/RetailBasic` and `/ar/sectors/healthcare` | 308 to the matching `/ar/...` target |
| `/careers`, `/help`, `/partners`, `/webinars` (and the `/ar/` versions) | 308 to `/about`, `/contact`, `/contact`, `/demo` |
| `/en/demo` | 307 to `/demo` |
| `/sectors/real-estate` with header `Cookie: NEXT_LOCALE=ar` | 200, English page (the cookie does not change the language) |
| `/dev-blocks` | 404 |
| `/robots.txt` | has `Sitemap: https://falcon-it.sa/sitemap.xml`, `Allow: /`, and disallows only `/admin`, `/setup` and `/api` |
| `/sitemap.xml` | the 7 sector URLs and `/erp/*` in both locales, no `RetailBasic`, no `/products/odoo-services` |
| `/api/settings/public` | no `+20` and no `Egypt` anywhere |

Raw HTML (what a crawler sees, no JavaScript):

```bash
for l in "" /ar; do
  curl -s "$BASE$l/" > /tmp/home-<ts>.html
  grep -c 'data-footer-column' /tmp/home-<ts>.html                # at least 3, and each column has links
  grep -ciE 'undefined|localhost|—|–' /tmp/home-<ts>.html          # expect 0
done
```

Also confirm the footer shows the CR and VAT numbers and the Saudi phone only, and that `/` and `/ar` carry the footer links in the raw HTML.

In a browser (private window):

- [ ] Admin: log in, open Pages (the list shows 19 pages plus the SEO-only index pages), open Pages > Home, open Sectors. Content opens and shows the notice pointing at Pages. Do not save anything.
- [ ] Language switch on `/demo?sector=retail&role=owner` lands on `/ar/demo?sector=retail&role=owner`.
- [ ] `/demo`: calendar slots render and a slot can be selected before the TEST booking below.
- [ ] Booking from a sector link: open `/demo?sector=retail&role=owner`, then submit one booking with the name `TEST v2 deploy`. Confirm the lead appears in admin Leads with the sector and role shown, and in Odoo (the lead contract is unchanged). Then delete the test lead in admin and in Odoo.
- [ ] Trackers (GTM, GA4, Ads, Snap) still load on `/` (network tab); no console errors.

Record every result in the deploy log at the end of this file.

## 7. Rollback (only if step 5 or 6 fails)

Application first, data only if damaged.

```bash
docker tag falconweb:rollback-eb827f8-<ts> falconweb:latest
docker compose -p falcon-it -f <stack-compose> up -d --no-deps app
docker inspect falcon-app --format '{{.Config.Image}} {{.State.Health.Status}}'
```

Then re-run the old-site smoke (`/`, `/ar`, `/sectors/RetailBasic`, `/products/odoo-services`, `/admin/login`).

The v2 migrations only add tables and columns and make data-only changes, so the old image is expected to keep working against the migrated database (new columns have defaults; nothing is dropped), with one known exception: the footer. The old footer links "Privacy policy" to `/privacy`. To undo the change made by `v2-footer-links`:

```bash
docker exec falcon-db psql -U falcon -d falcon -c "UPDATE footer_links SET url='/privacy' WHERE id='privacy' AND url='/privacy-policy';"
# optional, so a later redeploy of v2 applies the footer fix again:
docker exec falcon-db psql -U falcon -d falcon -c "DELETE FROM data_fixes WHERE key='v2-footer-links';"
```

Old sectors stay disabled and the applications brochure stays disabled; re-enable them in admin if the old site needs them back (use the ids saved in step 1a). Restore `/root/backups/falcon-<ts>.dump` with `pg_restore` only if data was damaged, and only after telling the owner.

## 8. Merge (the T-037 rule)

Immediately after a good smoke test, before anything else:

```bash
git checkout main
git pull --ff-only origin main
git merge --no-ff feat/website-v2 -m "Merge feat/website-v2: falcon-it.sa v2 (deployed as falconweb:<commit>)"
git push origin main
```

A direct-to-production deploy that is not merged into main is drift debt. Record the deployed commit, the image id and the merge commit below.

## Deploy log (fill in)

| Item | Value |
| --- | --- |
| Deploy start (UTC) | `<ts>` |
| Deployed commit | `<commit>` |
| Image id | `<image-id>` |
| Rollback image | `falconweb:rollback-eb827f8-<ts>` |
| Backup file (server only) | `/root/backups/falcon-<ts>.dump` |
| Step 1a query outputs | |
| Step 5 post-boot results | |
| Step 6 smoke results | |
| TEST lead removed (admin, Odoo) | |
| Merge commit on main | |
