// Marks this checkout as "installed" against the local test database so the
// app serves real pages instead of redirecting to /setup. The app decides
// "installed" from data/db-config.json (see src/lib/db/config.ts); that file is
// gitignored runtime state. Reads PG* from the environment (loaded from
// .env.test by playwright.config.ts or `node --env-file=.env.test`).
//
// Guarded: it only ever writes a config for a localhost database whose name
// ends in `_test`, and it never overwrites an existing config that points
// anywhere else.
import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.test");
} catch {
  // already provided by the environment
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function refuse(message) {
  console.error(`[prepare-test-env] REFUSING: ${message}`);
  process.exit(1);
}

const db = {
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "falcon_test",
  user: process.env.PGUSER || "falcon",
  password: process.env.PGPASSWORD || "falcon",
  ssl: false,
};

if (!LOCAL_HOSTS.has(db.host)) {
  refuse(`PGHOST must be localhost or 127.0.0.1 (got "${db.host}").`);
}
if (!db.database.endsWith("_test")) {
  refuse(`PGDATABASE must end in "_test" (got "${db.database}").`);
}

const dir = path.join(process.cwd(), "data");
const file = path.join(dir, "db-config.json");

if (fs.existsSync(file)) {
  let existing;
  try {
    existing = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    refuse(`${file} exists but is not valid JSON; not overwriting it. Move it aside first.`);
  }
  const e = existing?.db;
  if (!e || !LOCAL_HOSTS.has(e.host) || !String(e.database).endsWith("_test")) {
    refuse(
      `${file} already points at ${e?.user}@${e?.host}:${e?.port}/${e?.database}, which is not a local _test database. ` +
        "Move or delete it yourself if you really want to use the test database here.",
    );
  }
}

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, JSON.stringify({ installed: true, db }, null, 2), "utf-8");
console.log(`[prepare-test-env] data/db-config.json -> ${db.user}@${db.host}:${db.port}/${db.database}`);

// Third-party trackers off in the test database, so local dev, e2e and QA
// (Lighthouse, screenshots) runs never send page views to the real Snap Pixel
// or Google tags. Production defaults and the tracking code are unchanged.
// A brand-new test database has no integrations row yet: the app seeds it on
// first boot, and the next run of this script switches the trackers off.
const { default: pg } = await import("pg");
const pool = new pg.Pool({ ...db, max: 1, connectionTimeoutMillis: 5000 });
try {
  const exists = await pool.query(`SELECT to_regclass('public.integrations') IS NOT NULL AS ok`);
  if (exists.rows[0]?.ok) {
    const res = await pool.query(
      `UPDATE integrations SET snapchat_enabled = false, google_enabled = false
       WHERE id = 1 AND (snapchat_enabled OR google_enabled)`,
    );
    console.log(`[prepare-test-env] trackers off in the test database (${res.rowCount} row changed)`);
  } else {
    console.log("[prepare-test-env] no integrations table yet; trackers are switched off on the next run");
  }
} catch (err) {
  console.warn(`[prepare-test-env] could not switch trackers off: ${err.message}`);
} finally {
  await pool.end();
}
