// Marks this checkout as "installed" against the local test database so the
// app serves real pages instead of redirecting to /setup. The app decides
// "installed" from data/db-config.json (see src/lib/db/config.ts); that file is
// gitignored runtime state. Reads PG* from the environment (loaded from
// .env.test by playwright.config.ts or `node --env-file=.env.test`).
import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.test");
} catch {
  // already provided by the environment
}

const db = {
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "falcon_test",
  user: process.env.PGUSER || "falcon",
  password: process.env.PGPASSWORD || "falcon",
  ssl: false,
};

const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "db-config.json"),
  JSON.stringify({ installed: true, db }, null, 2),
  "utf-8",
);
console.log(`[prepare-test-env] data/db-config.json -> ${db.user}@${db.host}:${db.port}/${db.database}`);
