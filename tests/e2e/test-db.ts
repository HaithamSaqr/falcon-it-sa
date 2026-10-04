import { Pool } from "pg";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * A pool on the local e2e test database (PG* from .env.test). Refuses to
 * connect anywhere but a localhost database whose name ends in `_test`, the
 * same guard as the DB unit tests, so a stray env can never touch real data.
 */
export function testDb(): Pool {
  const host = process.env.PGHOST ?? "";
  const database = process.env.PGDATABASE ?? "";
  if (!LOCAL_HOSTS.has(host) || !database.endsWith("_test")) {
    throw new Error(
      `Refusing to use database "${database}" on "${host}": e2e DB helpers only run against a localhost database ending in _test.`,
    );
  }
  return new Pool({
    host,
    port: Number(process.env.PGPORT),
    database,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 1,
  });
}
