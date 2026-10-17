import "server-only";
import { wedding, type EventId } from "@/lib/content/wedding";
import { mockInvitations } from "./mock";
import type { EventResponse, Headcount, Household, Invitation, ReplyStatus } from "./types";

export type * from "./types";

// The only data API screens may call. Today it reads mock data; in the backend
// phase the bodies switch to Supabase and the signatures stay the same.

export async function getInvitation(token: string): Promise<Invitation | null> {
  return mockInvitations.find((i) => i.token === token) ?? null;
}

/**
 * Saves a household's reply. Mock: updates the in-memory list, so replies
 * last until the dev server restarts. Backend phase: an UPDATE in Supabase.
 */
export async function saveResponse(
  token: string,
  reply: { responses: Partial<Record<EventId, EventResponse>>; note: string | null },
): Promise<boolean> {
  const inv = mockInvitations.find((i) => i.token === token);
  if (!inv) return false;
  inv.responses = reply.responses;
  inv.note = reply.note;
  inv.respondedAt = new Date().toISOString();
  return true;
}

export function replyStatus(inv: Invitation): ReplyStatus {
  if (!inv.respondedAt || !inv.responses) return "waiting";
  return Object.values(inv.responses).some((r) => r?.attending) ? "attending" : "declined";
}

export async function listHouseholds(filter: { q?: string; status?: ReplyStatus } = {}): Promise<Household[]> {
  const q = filter.q?.trim().toLowerCase();
  return mockInvitations
    .map((inv) => ({ ...inv, status: replyStatus(inv) }))
    .filter((h) => !filter.status || h.status === filter.status)
    .filter((h) => {
      if (!q) return true;
      const names = Object.values(h.responses ?? {}).flatMap((r) => r?.names ?? []);
      return [h.householdName, h.phone ?? "", h.side ?? "", ...names].some((v) => v.toLowerCase().includes(q));
    })
    .sort((a, b) => a.householdName.localeCompare(b.householdName));
}

export async function getHeadcount(): Promise<Headcount[]> {
  return wedding.events.map((event) => {
    const id = event.id as EventId;
    let invited = 0;
    let confirmed = 0;
    let declined = 0;
    let waiting = 0;
    for (const inv of mockInvitations) {
      const seats = inv.seats[id] ?? 0;
      if (!seats) continue;
      invited += seats;
      const r = inv.responses?.[id];
      if (!inv.respondedAt || !r) waiting += seats;
      else if (r.attending) {
        confirmed += r.names.length;
        declined += seats - r.names.length;
      } else declined += seats;
    }
    return { eventId: id, eventName: event.name, invited, confirmed, declined, waiting };
  });
}

/** The events this household is invited to, with its seat limit for each. */
export function invitedEvents(inv: Invitation) {
  return wedding.events
    .map((event) => ({ ...event, seats: inv.seats[event.id as EventId] ?? 0 }))
    .filter((event) => event.seats > 0);
}

export function rsvpOpen(now = new Date()) {
  return now.getTime() <= new Date(wedding.rsvpDeadline).getTime();
}
