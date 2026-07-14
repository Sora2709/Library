import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * PostgreSQL is optional for this MongoDB-backed library system.
 * Keep the Drizzle client available for environments that provide DATABASE_URL,
 * without crashing local development when only MONGODB_URI is configured.
 */
const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool: Pool | null = databaseUrl
  ? globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl })
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = pool ? drizzle(pool) : null;
export const isPostgresConfigured = Boolean(databaseUrl);
