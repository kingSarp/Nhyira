import "server-only";
import { EVENTS } from "@/lib/content/wedding";
import { db } from "@/lib/db";
import { invitationColumns, toInvitation, type InvitationRow } from "./rows";
import type { Invitation } from "./types";

// Arrivals at the entrance. A household is checked in once; scanning again
// says when, so a screenshot passed to someone else is caught.

export type CheckInResult =
  | { status: "checked-in"; invitation: Invitation }
  | { status: "already"; invitation: Invitation }
  | { status: "unknown" };

/**
 * People a household can bring in: the names on their reply, else their seats.
 * The largest across current events, not the sum: it's the same people at
 * each (and rows from before the day became one event have three entries).
 */
export function peopleFor(inv: Invitation) {
  const per = EVENTS.map(({ id }) => {
    const r = inv.responses?.[id];
    return r?.attending ? r.names.length || (inv.seats[id] ?? 0) : r ? 0 : (inv.seats[id] ?? 0);
  });
  return Math.max(0, ...per);
}

/** Said yes to at least one current event. */
export function isComing(inv: Invitation) {
  return EVENTS.some(({ id }) => inv.responses?.[id]?.attending);
}

export async function checkIn(token: string, by: string): Promise<CheckInResult> {
  const sql = db();
  const cols = sql([...invitationColumns]);
  const [row] = await sql<InvitationRow[]>`
    update invitations set checked_in_at = now(), checked_in_by = ${by}
    where token = ${token} and checked_in_at is null
    returning ${cols}`;
  if (row) return { status: "checked-in", invitation: toInvitation(row) };
  const [existing] = await sql<InvitationRow[]>`select ${cols} from invitations where token = ${token}`;
  return existing ? { status: "already", invitation: toInvitation(existing) } : { status: "unknown" };
}

/** For mistakes at the entrance. */
export async function undoCheckIn(token: string) {
  await db()`update invitations set checked_in_at = null, checked_in_by = null where token = ${token}`;
}

/** Name or phone search for guests without their QR code. */
export async function findGuests(query: string, limit = 8): Promise<Invitation[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const sql = db();
  const digits = q.replace(/\D/g, "");
  const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await sql<InvitationRow[]>`
    select ${sql([...invitationColumns])} from invitations
    where household_name ilike ${like} or greeting ilike ${like}
       or (${digits.length >= 4} and phone_key like ${`%${digits.slice(-9)}%`})
    order by household_name
    limit ${limit}`;
  return rows.map(toInvitation);
}

/** Households and people expected (said yes) and arrived. */
export async function arrivalCounts() {
  const sql = db();
  const rows = await sql<InvitationRow[]>`select ${sql([...invitationColumns])} from invitations`;
  let expected = 0;
  let arrived = 0;
  let arrivedHouseholds = 0;
  for (const r of rows) {
    const inv = toInvitation(r);
    if (isComing(inv)) expected += peopleFor(inv);
    if (inv.checkedInAt) {
      arrived += peopleFor(inv);
      arrivedHouseholds += 1;
    }
  }
  return { expected, arrived, arrivedHouseholds };
}
