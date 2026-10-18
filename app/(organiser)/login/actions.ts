"use server";

import { redirect } from "next/navigation";
import { getOrganiser, signupsClosed } from "@/lib/auth";
import { MIN_PASSWORD } from "@/lib/password";
import { siteUrl } from "@/lib/site";
import { createSupabase } from "@/lib/supabase/server";

/** `field` says which input the error belongs to (email when absent). */
export type SignInState = { error?: string; email?: string; field?: "password" };
export type PasswordState = { error?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TOO_MANY = "Too many tries just now. Wait a few minutes, then try again.";
const LOCKED = "Sign-in is paused because new sign-ups are on in Supabase. Turn them off, then try again.";

/**
 * Email + password sign-in (Supabase Auth). Supabase gives the same error for
 * an unknown email and a wrong password, so the page doesn't reveal who has
 * an account.
 */
export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!EMAIL.test(email)) return { error: "Enter a complete email address.", email };
  if (!password) return { error: "Enter your password.", email, field: "password" };
  if (!(await signupsClosed())) return { error: LOCKED, email, field: "password" };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) return { error: TOO_MANY, email, field: "password" };
    if (error.status !== 400) console.error("Sign-in failed:", error.status, error.message);
    return { error: "That email and password don't match.", email, field: "password" };
  }
  redirect("/admin");
}

/**
 * Emails a link to set a new password. Supabase only sends it to existing
 * users but reports success either way, so everyone sees the same "sent" screen.
 */
export async function requestPasswordReset(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter a complete email address.", email };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=password`,
  });
  if (error) {
    console.error("Reset email failed:", error.status, error.message);
    return { email, error: error.status === 429 ? TOO_MANY : "We couldn't send the email. Try again in a minute." };
  }
  redirect(`/login?reset=sent&email=${encodeURIComponent(email)}`);
}

/** Sets the signed-in organiser's password (after following a reset link). */
export async function setNewPassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  if (!(await getOrganiser())) redirect("/login?error=link");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD) return { error: `Use at least ${MIN_PASSWORD} characters.` };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used here before." };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    console.error("Password change failed:", error.status, error.message);
    return { error: "We couldn't save that password. Try again." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
