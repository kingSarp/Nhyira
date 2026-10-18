// Creates the Nhyira tables in the database named by DATABASE_URL.
// Usage: npm run db:setup   (reads .env.local)
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Add it to .env.local (see .env.example).");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
try {
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(schema);
  const [{ n }] = await sql`select count(*)::int as n from invitations`;
  const links = await sql`select kind, code, enabled from signup_links order by kind`;
  console.log("Database ready.");
  console.log(`  Households: ${n}`);
  for (const l of links) console.log(`  ${l.kind} link: ${l.code} (${l.enabled ? "on" : "off"})`);
  const [bucket] = await sql`select 1 from storage.buckets where id = 'wedding-photos'`.catch(() => []);
  console.log(`  Photo storage: ${bucket ? "ready" : "MISSING (create the wedding-photos bucket in Supabase → Storage)"}`);
} catch (err) {
  console.error("Setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
