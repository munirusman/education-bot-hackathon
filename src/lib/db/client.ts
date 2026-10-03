import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { SCHEMA_SQL } from "./schema.ts";

/**
 * Embedded Postgres (PGlite) so the app runs with zero infrastructure. Point
 * DATABASE_URL at Neon/Supabase and swap this one file for a `pg` client for a
 * real deployment; repo.ts only uses `query`.
 */
export type Db = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
};

const g = globalThis as unknown as { __chDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  g.__chDb ??= open().catch((e) => {
    g.__chDb = undefined; // don't cache a failed init
    throw e;
  });
  return g.__chDb;
}

async function open(): Promise<Db> {
  const dir = process.env.PGDATA_PATH ?? ".data/pglite";
  if (dir !== ":memory:") mkdirSync(path.dirname(path.resolve(/*turbopackIgnore: true*/ dir)), { recursive: true });
  const pg = new PGlite(dir === ":memory:" ? undefined : dir);
  await pg.waitReady;
  await pg.exec(SCHEMA_SQL);
  return {
    async query<T>(sql: string, params?: unknown[]) {
      const res = await pg.query<T>(sql, params);
      return res.rows;
    },
    async exec(sql: string) {
      await pg.exec(sql);
    },
  };
}

/** Test helper: a fresh in-memory database. */
export async function openMemoryDb(): Promise<Db> {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(SCHEMA_SQL);
  return {
    async query<T>(sql: string, params?: unknown[]) {
      return (await pg.query<T>(sql, params)).rows;
    },
    async exec(sql: string) {
      await pg.exec(sql);
    },
  };
}
