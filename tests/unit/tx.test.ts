import { describe, expect, it, vi } from "vitest";
import type { Pool } from "pg";
import { withTransaction } from "@/lib/db/tx";
import { seedPageBlocks } from "@/lib/db/migrate";

/** A fake pg client: records statements, can fail on chosen ones. */
function fakePool(failOn: Set<string> = new Set()) {
  const statements: string[] = [];
  const release = vi.fn();
  const client = {
    query: vi.fn(async (sql: string) => {
      statements.push(sql);
      if (failOn.has(sql)) throw new Error(`${sql} failed`);
      return { rows: [], rowCount: 0 };
    }),
    release,
  };
  const pool = { connect: vi.fn(async () => client) } as unknown as Pool;
  return { pool, statements, release };
}

describe("withTransaction", () => {
  it("commits and returns the callback result, releasing the client normally", async () => {
    const { pool, statements, release } = fakePool();
    const out = await withTransaction(pool, async (c) => {
      await c.query("SELECT 1");
      return 42;
    });
    expect(out).toBe(42);
    expect(statements).toEqual(["BEGIN", "SELECT 1", "COMMIT"]);
    expect(release).toHaveBeenCalledTimes(1);
    expect(release.mock.calls[0][0]).toBeUndefined();
  });

  it("rolls back and rethrows the callback error, releasing the client normally", async () => {
    const { pool, statements, release } = fakePool();
    await expect(
      withTransaction(pool, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(statements).toEqual(["BEGIN", "ROLLBACK"]);
    expect(release).toHaveBeenCalledTimes(1);
    expect(release.mock.calls[0][0]).toBeUndefined();
  });

  it("destroys the client (release(err)) when ROLLBACK itself fails", async () => {
    const { pool, release } = fakePool(new Set(["ROLLBACK"]));
    await expect(
      withTransaction(pool, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(release).toHaveBeenCalledTimes(1);
    expect(release.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("rolls back when COMMIT fails", async () => {
    const { pool, statements } = fakePool(new Set(["COMMIT"]));
    await expect(withTransaction(pool, async () => 1)).rejects.toThrow("COMMIT failed");
    expect(statements).toEqual(["BEGIN", "COMMIT", "ROLLBACK"]);
  });
});

describe("seedPageBlocks", () => {
  it("never rejects when the pool cannot connect", async () => {
    const pool = { connect: vi.fn(async () => Promise.reject(new Error("db down"))) } as unknown as Pool;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(seedPageBlocks(pool)).resolves.toBeUndefined();
      expect(pool.connect).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});
