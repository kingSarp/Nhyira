import type { Metadata } from "next";
import { OpenSignupForm } from "@/components/guest/SignupForms";
import { SignupClosed, SignupShell } from "@/components/guest/SignupShell";
import { getWedding, openLinkEvents, resolveSignupLink } from "@/lib/data";
import { longDate, shortDate } from "@/lib/format";
import { previewImages } from "@/lib/og";
import { displayTime } from "@/lib/wedding";
import { submitOpenSignup } from "./actions";

// This is the link that gets shared on WhatsApp, so the title and description
// are what people read under the preview card.
export async function generateMetadata(): Promise<Metadata> {
  const w = await getWedding();
  const title = `${w.coupleNames} are getting married`;
  const description = `Sign up to celebrate with us on ${longDate(w.date)}. One person per sign-up.`;
  const card = previewImages(w);
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { type: "website", title, description, images: card.og },
    twitter: { card: "summary_large_image", title, description, images: card.twitter },
  };
}

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

  const events = (await openLinkEvents(link)).map((e) => ({
    id: e.id,
    name: e.name,
    when: `${shortDate(e.date)} · ${displayTime(e.time)} · ${e.venue}`,
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
