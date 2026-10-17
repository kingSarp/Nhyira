import type { Metadata } from "next";
import { OpenSignupForm } from "@/components/guest/SignupForms";
import { SignupClosed, SignupShell } from "@/components/guest/SignupShell";
import { openLinkEvents, resolveSignupLink } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { submitOpenSignup } from "./actions";

export const metadata: Metadata = { title: "Sign up", robots: { index: false, follow: false } };

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  const { state, link } = await resolveSignupLink("open", code);

  if (state === "full") {
    return (
      <SignupClosed title="Sign-ups are full">
        Thank you for your interest. Every place on this link has been taken.
      </SignupClosed>
    );
  }
  if (state !== "active") {
    return (
      <SignupClosed title="This link is no longer taking sign-ups">
        If you were invited, please use the personal link from your WhatsApp message.
      </SignupClosed>
    );
  }

  const events = openLinkEvents(link).map((e) => ({
    id: e.id,
    name: e.name,
    when: `${shortDate(e.date)} · ${e.time} · ${e.venue}`,
  }));

  return (
    <SignupShell
      eyebrow="Join us"
      title="Sign up to celebrate"
      lead="This link is for one person. Sign up yourself and you'll get your own invitation link."
    >
      <OpenSignupForm action={submitOpenSignup.bind(null, code)} events={events} />
    </SignupShell>
  );
}
