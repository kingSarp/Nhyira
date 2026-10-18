"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addStaff, getStaff, listStaff, removeStaff, resetStaffPassword, setStaffRole } from "@/lib/data";
import type { StaffRole } from "@/lib/auth";

/** What the Team forms show: errors, or new sign-in details (shown once, never stored). */
export type TeamFormState =
  | { status: "idle" }
  | { status: "invalid"; email: string; message: string }
  | { status: "created"; email: string; password: string; role: StaffRole }
  | { status: "reset"; email: string; password: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function requireOrganiser() {
  const staff = await getStaff();
  if (staff?.role !== "organiser") redirect("/login");
  return staff;
}

export async function addTeamMember(_prev: TeamFormState, form: FormData): Promise<TeamFormState> {
  await requireOrganiser();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role: StaffRole = form.get("role") === "organiser" ? "organiser" : "usher";
  if (!EMAIL.test(email)) return { status: "invalid", email, message: "Enter a complete email address." };
  const result = await addStaff(email, role);
  if (!result.ok) {
    return {
      status: "invalid",
      email,
      message: result.reason === "exists" ? "That email already has an account. Find it in the list below." : "We couldn't add them. Try again.",
    };
  }
  revalidatePath("/admin/team");
  return { status: "created", email, password: result.password, role };
}

export async function resetTeamPassword(id: string): Promise<TeamFormState> {
  await requireOrganiser();
  try {
    const { email, password } = await resetStaffPassword(id);
    return { status: "reset", email, password };
  } catch (err) {
    console.error("Password reset failed", err);
    return { status: "invalid", email: "", message: "We couldn't reset the password. Try again." };
  }
}

export async function changeTeamRole(id: string, role: StaffRole) {
  const me = await requireOrganiser();
  if (id === me.id) redirect("/admin/team?error=self");
  await setStaffRole(id, role);
  revalidatePath("/admin/team");
  redirect("/admin/team?changed=1");
}

export async function removeTeamMember(id: string) {
  const me = await requireOrganiser();
  if (id === me.id) redirect("/admin/team?error=self");
  const staff = await listStaff();
  const removed = staff.find((s) => s.id === id);
  await removeStaff(id);
  revalidatePath("/admin/team");
  redirect(`/admin/team?removed=${encodeURIComponent(removed?.email ?? "Account")}`);
}
