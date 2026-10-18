"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { createSupabase } from "@/lib/supabase/server";

export type SignInState = { error?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Emails a one-time sign-in link (Supabase Auth). Only addresses in
 * ADMIN_EMAILS get one; others see the same "link sent" screen, so the page
 * doesn't reveal who has access.
 */
export async function requestSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter a complete email address.", email };

  if (isAdminEmail(email)) {
    const supabase = await createSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl()}/auth/confirm`, shouldCreateUser: true },
    });
    if (error) {
      console.error("Sign-in link failed:", error.status, error.message);
      return {
        email,
        error:
          error.status === 429
            ? "Too many links sent just now. Wait a few minutes, then try again."
            : "We couldn't send the link. Try again in a minute.",
      };
    }
  }
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

/** "Send it again" on the link-sent screen. */
export async function resendSignInLink(form: FormData) {
  const state = await requestSignInLink({}, form);
  const email = encodeURIComponent(String(form.get("email") ?? ""));
  redirect(state.error ? `/login?error=send&email=${email}` : `/login?sent=1&email=${email}`);
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
