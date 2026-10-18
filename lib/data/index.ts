import "server-only";
import { wedding, type EventId } from "@/lib/content/wedding";
import { db } from "@/lib/db";
import { invitationColumns, toInvitation, type InvitationRow } from "./rows";
import type { EventResponse, Headcount, Household, Invitation, ReplyStatus } from "./types";

export type * from "./types";
export * from "./signups";
export * from "./households";
export { getOrganiser } from "@/lib/auth";

// The only data API screens may call. Postgres (Supabase) on the server.

export async function allInvitations(): Promise<Invitation[]> {
  const sql = db();
  const rows = await sql<InvitationRow[]>`select ${sql([...invitationColumns])} from invitations`;
  return rows.map(toInvitation);
}

export async function getInvitation(token: string): Promise<Invitation | null> {
  const sql = db();
  const [row] = await sql<InvitationRow[]>`select ${sql([...invitationColumns])} from invitations where token = ${token}`;
  return row ? toInvitation(row) : null;
}

/** Saves a household's reply (replacing any earlier one). */
export async function saveResponse(
  token: string,
  reply: { responses: Partial<Record<EventId, EventResponse>>; note: string | null },
): Promise<boolean> {
  const sql = db();
  const rows = await sql`
    update invitations
    set responses = ${sql.json(reply.responses)}, note = ${reply.note}, responded_at = now()
    where token = ${token}
    returning token`;
  return rows.length > 0;
}

export function replyStatus(inv: Invitation): ReplyStatus {
  if (!inv.respondedAt || !inv.responses) return "waiting";
  return Object.values(inv.responses).some((r) => r?.attending) ? "attending" : "declined";
}

// A few hundred households at most, so filtering and counting happen here
// rather than in SQL. One query per page.

export async function listHouseholds(filter: { q?: string; status?: ReplyStatus } = {}): Promise<Household[]> {
  const q = filter.q?.trim().toLowerCase();
  return (await allInvitations())
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
  const invitations = await allInvitations();
  return wedding.events.map((event) => {
    const id = event.id as EventId;
    let invited = 0;
    let confirmed = 0;
    let declined = 0;
    let waiting = 0;
    for (const inv of invitations) {
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
