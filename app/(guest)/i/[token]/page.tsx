import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenStub } from "@/components/dev/ScreenStub";
import { getInvitation, invitedEvents, replyStatus, rsvpOpen } from "@/lib/data";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const invitation = await getInvitation(token);
  if (!invitation) notFound();

  const events = invitedEvents(invitation);

  return (
    <ScreenStub
      title="Invite and RSVP"
      boards={[
        "1a · Invite page, first open",
        "1b · Filling in, with errors",
        "1c · Submitted",
        "1d · Returning guest",
        "1e · RSVP closed",
      ]}
      states={[
        "First open: no reply yet, RSVP open",
        "Errors: event unanswered, empty seat name",
        "Submitted: thank-you hero and summary",
        "Returning: welcome back, form pre-filled",
        "Closed: notice with Auntie Efua's number",
      ]}
      data={{
        household: invitation.householdName,
        events: events.map((e) => `${e.name} (admits ${e.seats})`).join(", "),
        status: replyStatus(invitation),
        rsvpOpen: rsvpOpen() ? "yes" : "no",
      }}
    />
  );
}
