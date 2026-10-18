import "server-only";
import { createSupabase } from "@/lib/supabase/server";

/** Emails allowed into the dashboard, from ADMIN_EMAILS (comma-separated). */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  return !!email && adminEmails().includes(email.trim().toLowerCase());
}

/** Who is signed in to the dashboard, or null. Removing an email from ADMIN_EMAILS locks it out at once. */
export async function getOrganiser(): Promise<{ email: string } | null> {
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (error || !isAdminEmail(email)) return null;
  return { email: email! };
}
