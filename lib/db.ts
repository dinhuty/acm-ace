import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

type DB = NodePgDatabase<typeof schema>;

let instance: DB | undefined;

function getDb(): DB {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set.");
    }
    instance = drizzle(new Pool({ connectionString }), { schema });
  }
  return instance;
}

// Lazy proxy: the Pool and the DATABASE_URL check happen on first query, not at
// import. `next build` imports this module graph without DATABASE_URL (e.g. in
// the Docker builder stage, where .env* is excluded) — deferring keeps the build
// working; dynamic routes only query at request time when the env is present.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
