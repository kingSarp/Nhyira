import "server-only";
import { createSupabase, supabaseEnv } from "@/lib/supabase/server";

// Organisers are the users in Supabase → Authentication → Users, added there
// by hand. Anyone with a valid session is an organiser, which is only safe
// while Supabase sign-ups are off (otherwise anyone could create an account
// through the public API). So we check that setting and lock the dashboard if
// it's ever turned back on.

/** True when Supabase refuses new sign-ups. Cached for 5 minutes; fails closed. */
export async function signupsClosed(): Promise<boolean> {
  const { url, key } = supabaseEnv();
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if ((await res.json()).disable_signup === true) return true;
    console.error(
      "Dashboard locked: Supabase sign-ups are on. Turn off Authentication → Sign In / Providers → Allow new users to sign up.",
    );
  } catch (err) {
    console.error("Dashboard locked: couldn't read Supabase auth settings.", err);
  }
  return false;
}

/** Who is signed in to the dashboard, or null. Deleting a user in Supabase locks them out within the hour. */
export async function getOrganiser(): Promise<{ email: string } | null> {
  const supabase = await createSupabase();
  const [{ data, error }, closed] = await Promise.all([supabase.auth.getClaims(), signupsClosed()]);
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (error || !email || !closed) return null;
  return { email };
}
