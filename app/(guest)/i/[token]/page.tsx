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
import { wedding } from "@/lib/content/wedding";
import { getInvitation, invitedEvents, rsvpOpen } from "@/lib/data";
import { dayMonth } from "@/lib/format";
import { submitRsvp } from "./actions";

export async function generateMetadata({ params }: PageProps<"/i/[token]">): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getInvitation(token);
  return {
    title: invitation ? `${invitation.greeting ?? invitation.householdName}, you're invited` : "Invitation",
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const invitation = await getInvitation(token);
  if (!invitation) notFound();

  const name = invitation.greeting ?? invitation.householdName;
  const events = invitedEvents(invitation);
  const replied = !!invitation.respondedAt;
  const deadline = dayMonth(wedding.rsvpDeadline);
  // ?preview=closed shows the closed state for review; ignored on the live site.
  const previewClosed = sp.preview === "closed" && process.env.VERCEL_ENV !== "production";
  const open = rsvpOpen() && !previewClosed;

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
        <HeroPhoto image={wedding.story[0]} eyebrow="See you soon" height="short" stacked={false} names="lg" />
        <Notice tone="info" icon="lock" className="mx-7 mt-9">
          Replies have closed. To change yours, call {wedding.contact.name} on {wedding.contact.phone}.
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
            src={wedding.images.thanks.src}
            alt={wedding.images.thanks.alt}
            focus={wedding.images.thanks.focus}
            sizes={fullColumn}
            priority
            scrimHeight="55%"
            className="h-[min(620px,80svh)] min-h-[480px]"
          >
            <div role="status" className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 px-6 text-center text-white">
              <p className="m-0 text-[12px] uppercase tracking-[0.32em]">{name}, your reply is in</p>
              <h1 className="m-0 font-display text-[66px] font-light italic leading-none">Thank you</h1>
              <CoupleNames size="md" as="p" className="text-[48px]" />
            </div>
          </Photo>
        </header>
        <section aria-label="Your reply" className="flex flex-col px-7 pt-10">
          <p className="m-0 mb-7 text-center text-ink-2">We can&apos;t wait to celebrate with you.</p>
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
        <HeroPhoto image={wedding.images.returning} height="short" stacked={false} names="md" />
        <section aria-label="Welcome back" className="flex flex-col items-center gap-2 px-7 pt-11 pb-2 text-center">
          <p className="type-greeting m-0 text-[30px]">Welcome back, {name}</p>
          <p className="type-meta m-0">Your reply is below. Change it until {deadline}.</p>
        </section>
        <RsvpSection heading={false}>
          {form("Update my reply")}
          <Link href={`/i/${token}?view=full`} className="flex min-h-11 items-center self-center text-[15px]">
            See our story &amp; event details
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
