import "server-only";
import postgres from "postgres";

// One connection pool per server process. The site talks to Postgres directly
// from the server (never from the browser), through Supabase's connection
// pooler. See ARCHITECTURE.md §5.

declare global {
  var __nhyiraSql: postgres.Sql | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return postgres(url, {
    // Supabase's transaction pooler (port 6543) doesn't support prepared statements.
    prepare: false,
    // Serverless functions each hold their own pool; keep it small.
    max: process.env.VERCEL ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
}

export function db() {
  return (globalThis.__nhyiraSql ??= connect());
}

/** Postgres "unique_violation", e.g. a phone number that's already on the list. */
export function isUniqueViolation(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}
