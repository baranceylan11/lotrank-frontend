import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

declare global {
  // The Worker entrypoint assigns the request's binding before vinext handles it.
  // This avoids importing the Cloudflare runtime module in Node-based render tests.
  var __LOTRANK_DB__: D1Database | undefined;
}

export function getDb() {
  if (!globalThis.__LOTRANK_DB__) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(globalThis.__LOTRANK_DB__, { schema });
}
