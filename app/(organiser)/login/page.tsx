import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginShell } from "@/components/organiser/LoginShell";
import { ResetRequestForm, SignInForm } from "@/components/organiser/SignInForm";
import { Notice } from "@/components/ui";
import { getStaff, homeFor } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

const BackToSignIn = () => (
  <Link href="/login" className="flex min-h-11 items-center self-center text-[16px]">
    Back to sign in
  </Link>
);

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : "";
  const staff = await getStaff();
  if (staff) redirect(homeFor(staff.role));

  /* Reset email sent */
  if (sp.reset === "sent") {
    return (
      <LoginShell title="Check your email">
        <Notice tone="success" icon="mail" title={email ? `Email sent to ${email}` : "Email sent"}>
          Tap the link in it within 1 hour to choose a new password.
        </Notice>
        <p className="m-0 text-center text-[16px] text-ink-2">Nothing yet? Check your spam folder.</p>
        <BackToSignIn />
      </LoginShell>
    );
  }

  /* Reset link expired or already used */
  if (sp.error === "link") {
    return (
      <LoginShell title="Reset password">
        <Notice tone="error" title="That link has expired.">
          Links work for 1 hour and only once. We&apos;ll send you a fresh one.
        </Notice>
        <ResetRequestForm email={email} submitLabel="Email me a new link" />
        <BackToSignIn />
      </LoginShell>
    );
  }

  /* Forgot password */
  if (sp.forgot === "1") {
    return (
      <LoginShell title="Reset password" lead="We'll email you a link to choose a new password.">
        <ResetRequestForm email={email} submitLabel="Email me a link" />
        <BackToSignIn />
      </LoginShell>
    );
  }

  /* Sign in */
  return (
    <LoginShell title="Guest list sign in">
      <SignInForm email={email} />
      <p className="m-0 text-center text-[15px] text-ink-2">Only emails the couple has added can sign in.</p>
    </LoginShell>
  );
}
