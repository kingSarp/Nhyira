import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosedCelebrations } from "@/components/guest/ClosedCelebrations";
import { ClosingPhoto } from "@/components/guest/ClosingPhoto";
import { EventList } from "@/components/guest/EventList";
import { Greeting } from "@/components/guest/Greeting";
import { GuestPage } from "@/components/guest/GuestPage";
import { HeroPhoto } from "@/components/guest/HeroPhoto";
import { ReplySummary } from "@/components/guest/ReplySummary";
import { Roses } from "@/components/guest/Roses";
import { RsvpForm } from "@/components/guest/RsvpForm";
import { RsvpSection } from "@/components/guest/RsvpSection";
import { Story } from "@/components/guest/Story";
import { fullColumn } from "@/components/guest/sizes";
import { Button, CoupleNames, Notice, Photo } from "@/components/ui";
import { getInvitation, getWedding, invitedEvents, rsvpOpen } from "@/lib/data";
import { dayMonth } from "@/lib/format";
import { previewImages } from "@/lib/og";
import { submitRsvp } from "./actions";

export async function generateMetadata({ params }: PageProps<"/i/[token]">): Promise<Metadata> {
  const { token } = await params;
  const [invitation, w] = await Promise.all([getInvitation(token), getWedding()]);
  const title = invitation ? `${invitation.greeting ?? invitation.householdName}, you're invited` : "Invitation";
  const card = previewImages(w, invitation ? { token, name: invitation.householdName } : undefined);
  const description = `${w.coupleNames} would love you to celebrate with them. Tap to see the details and reply.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", images: card.og },
    twitter: { card: "summary_large_image", title, description, images: card.twitter },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const invitation = await getInvitation(token);
  if (!invitation) notFound();

  const name = invitation.greeting ?? invitation.householdName;
  const [w, events, isOpen] = await Promise.all([getWedding(), invitedEvents(invitation), rsvpOpen()]);
  const replied = !!invitation.respondedAt;
  const deadline = dayMonth(w.rsvpDeadline);
  // ?preview=closed shows the closed state for review; ignored on the live site.
  const previewClosed = sp.preview === "closed" && process.env.VERCEL_ENV !== "production";
  const open = isOpen && !previewClosed;

  const form = (submitLabel: string) => (
    <RsvpForm
      events={events.map(({ id, name, seats }) => ({ id, name, seats }))}
      initial={invitation.responses}
      initialNote={invitation.note}
      action={submitRsvp.bind(null, token)}
      submitLabel={submitLabel}
    />
  );

  /* 1e · Replies closed */
  if (!open) {
    return (
      <GuestPage>
        <HeroPhoto eyebrow="See you soon" height="short" stacked={false} names="lg" />
        <Notice tone="info" icon="lock" className="mx-7 mt-9">
          Replies have closed. To change yours, {w.contact.phone ? `call ${w.contact.name} on ${w.contact.phone}` : `contact ${w.contact.name}`}.
        </Notice>
        <ClosedCelebrations events={events} invitation={invitation} />
        <footer className="flex justify-center px-7 py-14">
          <Roses size="sm" />
        </footer>
      </GuestPage>
    );
  }

  /* 1c · Just submitted */
  if (sp.sent === "1" && replied) {
    return (
      <GuestPage>
        <header>
          <Photo
            src={w.images.couple.src}
            alt={w.images.couple.alt}
            focus={w.images.couple.focus}
            sizes={fullColumn}
            priority
            scrimHeight="55%"
            className="h-[min(620px,80svh)] min-h-[480px]"
          >
            <div role="status" className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 px-6 text-center text-white">
              <p className="m-0 text-[12px] uppercase tracking-[0.32em]">{name}, your reply is in</p>
              <h1 className="m-0 font-display text-[66px] font-light italic leading-none">Thank you</h1>
              <CoupleNames partners={w.partners} size="md" as="p" className="text-[48px]" />
            </div>
          </Photo>
        </header>
        <section aria-label="Your reply" className="flex flex-col px-7 pt-10">
          <p className="m-0 mb-7 text-center text-ink-2">We can&apos;t wait to celebrate with you.</p>
          {sp.new === "1" && (
            <Notice tone="info" icon="check" title="This page is your invitation" className="mb-7">
              Save this link or add it to your home screen. Open it again any time to see the details or change your reply.
            </Notice>
          )}
          <ReplySummary events={events} invitation={invitation} />
        </section>
        <section className="flex flex-col items-center gap-[18px] px-7 pt-10 pb-14">
          <Button href={`/i/${token}`} variant="secondary" fullWidth>
            Change my reply
          </Button>
          <p className="m-0 text-center text-[14px] text-ink-2">Changes allowed until {deadline}</p>
          <Roses size="sm" className="mt-2" />
        </section>
      </GuestPage>
    );
  }

  /* 1d · Returning guest */
  if (replied && sp.view !== "full") {
    return (
      <GuestPage>
        <HeroPhoto height="short" stacked={false} names="md" />
        <section aria-label="Welcome back" className="flex flex-col items-center gap-2 px-7 pt-11 pb-2 text-center">
          <p className="type-greeting m-0 text-[30px]">Welcome back, {name}</p>
          <p className="type-meta m-0">Your reply is below. Change it until {deadline}.</p>
        </section>
        <RsvpSection heading={false}>
          {form("Update my reply")}
          <Link href={`/i/${token}?view=full`} className="flex min-h-11 items-center self-center text-[15px]">
            See the full invitation
          </Link>
        </RsvpSection>
      </GuestPage>
    );
  }

  /* 1a · First open (1b errors render inside the form) */
  return (
    <GuestPage>
      <HeroPhoto eyebrow="You're invited" />
      <Greeting name={name} />
      <Story />
      <EventList events={events} />
      <RsvpSection>{form(replied ? "Update my reply" : "Send my reply")}</RsvpSection>
      <ClosingPhoto />
    </GuestPage>
  );
}
