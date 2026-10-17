"use server";

import { redirect } from "next/navigation";

export type SignInState = { error?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Frontend phase: checks the address and shows "link sent". No email is sent.
 * Backend phase: Supabase Auth magic link, limited to ADMIN_EMAILS, and the
 * address moves out of the URL.
 */
export async function requestSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter a complete email address.", email };
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}
