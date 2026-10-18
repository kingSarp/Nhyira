import "server-only";
import { createClient } from "@supabase/supabase-js";

// Supabase with the project's secret key: creates and removes staff accounts
// from the Team page. Server only, never sent to the browser. Set
// SUPABASE_SECRET_KEY (Supabase → Project Settings → API Keys → Secret keys).

export function hasAdminKey() {
  return !!process.env.SUPABASE_SECRET_KEY;
}

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY is not set. See README → Team.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
