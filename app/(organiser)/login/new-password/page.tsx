import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginShell } from "@/components/organiser/LoginShell";
import { NewPasswordForm } from "@/components/organiser/SignInForm";
import { getOrganiser } from "@/lib/auth";

export const metadata: Metadata = { title: "New password" };

// Reached from the reset email (via /auth/confirm), which signs the organiser in first.
export default async function NewPasswordPage() {
  const organiser = await getOrganiser();
  if (!organiser) redirect("/login?error=link");

  return (
    <LoginShell title="Choose a password" lead={`For ${organiser.email}`}>
      <NewPasswordForm />
    </LoginShell>
  );
}
