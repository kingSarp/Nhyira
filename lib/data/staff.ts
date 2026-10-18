import "server-only";
import { randomInt } from "node:crypto";
import type { StaffRole } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Staff accounts (organisers and ushers), managed from /admin/team. They are
// Supabase Auth users; the role is in app_metadata, which users can't change.

export type StaffMember = { id: string; email: string; role: StaffRole; lastSignInAt: string | null };

const roleOf = (meta: unknown): StaffRole => ((meta as { role?: unknown } | null)?.role === "usher" ? "usher" : "organiser");

export async function listStaff(): Promise<StaffMember[]> {
  const { data, error } = await createSupabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users
    .filter((u) => u.email)
    .map((u) => ({ id: u.id, email: u.email!, role: roleOf(u.app_metadata), lastSignInAt: u.last_sign_in_at ?? null }))
    .sort((a, b) => (a.role === b.role ? a.email.localeCompare(b.email) : a.role === "organiser" ? -1 : 1));
}

const WORDS = [
  "mango", "river", "cedar", "palm", "amber", "coral", "lotus", "maple", "olive", "pearl", "ruby", "sage",
  "tulip", "willow", "zebra", "lemon", "berry", "cocoa", "honey", "ivory", "jade", "kente", "lily", "melon",
  "ocean", "peach", "quartz", "rose", "silver", "tiger", "violet", "breeze", "candle", "daisy", "ember", "forest",
  "garden", "harbor", "island", "jasmine", "kettle", "lantern", "meadow", "nectar", "orchid", "pepper", "rainbow", "sunset",
];

/**
 * Three words and four digits, e.g. "mango-river-cedar-4821": easy to type on a
 * phone, about 1.1 billion combinations. Supabase rate-limits sign-in attempts.
 */
export function newPassword() {
  const word = () => WORDS[randomInt(WORDS.length)];
  return `${word()}-${word()}-${word()}-${String(randomInt(10000)).padStart(4, "0")}`;
}

export type AddStaffResult = { ok: true; email: string; password: string } | { ok: false; reason: "exists" | "failed" };

export async function addStaff(email: string, role: StaffRole): Promise<AddStaffResult> {
  const password = newPassword();
  const { error } = await createSupabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });
  if (error) {
    if (error.status === 422 || /already/i.test(error.message)) return { ok: false, reason: "exists" };
    console.error("Add staff failed:", error.status, error.message);
    return { ok: false, reason: "failed" };
  }
  return { ok: true, email, password };
}

/** A new password for someone, shown once to the organiser who asked. */
export async function resetStaffPassword(id: string): Promise<{ email: string; password: string }> {
  const password = newPassword();
  const { data, error } = await createSupabaseAdmin().auth.admin.updateUserById(id, { password });
  if (error) throw error;
  return { email: data.user.email!, password };
}

export async function setStaffRole(id: string, role: StaffRole) {
  const admin = createSupabaseAdmin();
  const { data, error: getError } = await admin.auth.admin.getUserById(id);
  if (getError) throw getError;
  const { error } = await admin.auth.admin.updateUserById(id, { app_metadata: { ...data.user.app_metadata, role } });
  if (error) throw error;
}

export async function removeStaff(id: string) {
  const { error } = await createSupabaseAdmin().auth.admin.deleteUser(id);
  if (error) throw error;
}
