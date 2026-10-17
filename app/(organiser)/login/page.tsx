import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignInForm } from "@/components/organiser/SignInForm";
import { Button, Notice } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";

export const metadata: Metadata = { title: "Sign in" };

function Shell({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-8 px-6 pt-[clamp(48px,14vh,120px)] pb-12">
      <header className="flex flex-col items-center gap-2.5 text-center">
        <p className="m-0 font-script text-[48px] leading-tight">{wedding.coupleNames}</p>
        <h1 className="type-org-title m-0">{title}</h1>
        {lead && <p className="m-0 text-ink-2">{lead}</p>}
      </header>
      {children}
    </main>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : "";
  const showDevLink = process.env.VERCEL_ENV !== "production";

  /* 4b · Link sent */
  if (sp.sent === "1") {
    return (
      <Shell title="Check your email">
        <Notice tone="success" icon="mail" title={email ? `Link sent to ${email}` : "Link sent"}>
          Tap it on this phone within 1 hour to open the guest list.
        </Notice>
        <div className="flex flex-col gap-4">
          <p className="m-0 text-center text-[16px] text-ink-2">Nothing yet? Check your spam folder, or</p>
          <form action="/login" className="contents">
            {/* Frontend phase: resending just shows this screen again. */}
            <input type="hidden" name="sent" value="1" />
            <input type="hidden" name="email" value={email} />
            <Button type="submit" variant="secondary" fullWidth>
              Send it again
            </Button>
          </form>
          <Link href="/login" className="flex min-h-11 items-center self-center text-[16px]">
            Use a different email
          </Link>
        </div>
        {showDevLink && (
          <aside className="flex flex-col gap-1 border border-dashed border-border px-4 py-3.5 text-[14px] text-ink-2">
            <span className="text-[12px] uppercase tracking-[0.12em]">Preview only: pretend to tap the email link</span>
            <span className="flex flex-wrap gap-4">
              <Link href="/admin" className="flex min-h-11 items-center">
                Link works →
              </Link>
              <Link href={`/login?error=link&email=${encodeURIComponent(email)}`} className="flex min-h-11 items-center">
                Link expired →
              </Link>
            </span>
          </aside>
        )}
      </Shell>
    );
  }

  /* 4c · Link expired */
  if (sp.error === "link") {
    return (
      <Shell title="Guest list sign in">
        <Notice tone="error" title="That link has expired.">
          Links work for 1 hour and only once. We&apos;ll send you a fresh one.
        </Notice>
        <SignInForm email={email} submitLabel="Email me a new link" />
      </Shell>
    );
  }

  /* 4a · Sign in */
  return (
    <Shell title="Guest list sign in" lead="We'll email you a link. No password needed.">
      <SignInForm submitLabel="Email me a sign-in link" />
      <p className="m-0 text-center text-[15px] text-ink-2">Only emails the couple has added can sign in.</p>
    </Shell>
  );
}
