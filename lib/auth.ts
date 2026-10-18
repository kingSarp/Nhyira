import "server-only";
import { cache } from "react";
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

export type StaffRole = "organiser" | "usher";
export type Staff = { id: string; email: string; role: StaffRole };

/**
 * Who is signed in, and what they may do. Ushers (app_metadata.role = "usher",
 * set from the Team page; users can't change their own app_metadata) only get
 * the check-in screen. Everyone else is an organiser. Null while sign-ups are on.
 *
 * Asks Supabase Auth every time (getUser, not the cached token), so removing
 * someone or changing their role on the Team page takes effect at once.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createSupabase();
  const [{ data, error }, closed] = await Promise.all([supabase.auth.getUser(), signupsClosed()]);
  const email = data.user?.email ?? null;
  if (error || !email || !closed) return null;
  return { id: data.user!.id, email, role: (data.user!.app_metadata as { role?: unknown }).role === "usher" ? "usher" : "organiser" };
});

/** Signed in with full dashboard access, or null. Deleting a user in Supabase locks them out within the hour. */
export async function getOrganiser(): Promise<{ email: string } | null> {
  const staff = await getStaff();
  return staff?.role === "organiser" ? { email: staff.email } : null;
}

/** Where someone lands after signing in. */
export function homeFor(role: StaffRole) {
  return role === "usher" ? "/checkin" : "/admin";
}
