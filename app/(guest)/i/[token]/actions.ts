"use server";

import { redirect } from "next/navigation";
import { getInvitation, invitedEvents, rsvpOpen, saveResponse } from "@/lib/data";
import { parseRsvp, toResponses, validateRsvp, type RsvpState } from "@/lib/rsvp";

export async function submitRsvp(token: string, _prev: RsvpState, form: FormData): Promise<RsvpState> {
  const invitation = await getInvitation(token);
  if (!invitation) redirect(`/i/${token}`);

  const events = invitedEvents(invitation);
  const values = parseRsvp(form, events);

  if (!rsvpOpen()) {
    return { status: "failed", values, message: "Replies have closed, so this change wasn't saved." };
  }

  const errors = validateRsvp(values, events);
  if (errors) return { status: "invalid", values, errors };

  const saved = await saveResponse(token, {
    responses: toResponses(values, events),
    note: values.note.trim() || null,
  });
  if (!saved) {
    return { status: "failed", values, message: "We couldn't save your reply. Please try again in a moment." };
  }

  redirect(`/i/${token}?sent=1`);
}
