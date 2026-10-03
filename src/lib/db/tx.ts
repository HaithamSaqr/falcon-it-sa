import type { Pool, PoolClient } from "pg";

/**
 * Run `fn` inside BEGIN/COMMIT on one pooled client. On any error the
 * transaction is rolled back and the error rethrown. If the ROLLBACK itself
 * fails the connection is unusable, so the client is released with that error
 * (pg destroys it instead of returning it to the pool).
 */
export async function withTransaction<T>(pool: Pool, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      broken = rollbackErr instanceof Error ? rollbackErr : new Error(String(rollbackErr));
    }
    throw err;
  } finally {
    client.release(broken);
  }
}
