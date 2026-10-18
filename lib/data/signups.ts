import "server-only";
import { randomBytes } from "node:crypto";
import type postgres from "postgres";
import { wedding, type EventId } from "@/lib/content/wedding";
import { db, isUniqueViolation } from "@/lib/db";
import { newToken, phoneKey } from "./ids";
import { getWedding } from "./wedding";
import {
  invitationColumns,
  toInvitation,
  toJoinRequest,
  toSignupLink,
  type InvitationRow,
  type JoinRequestRow,
  type SignupLinkRow,
} from "./rows";
import type { Invitation, JoinRequest, RequestStatus, SignupLink, SignupLinkKind, SignupLinkState } from "./types";

// Shared links (request a place, open one-seat sign-up) and join requests.

type Tx = postgres.TransactionSql | postgres.Sql;

function code(prefix: string) {
  return `${prefix}-${randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x")}`;
}

export async function getSignupLinks(): Promise<Record<SignupLinkKind, SignupLink>> {
  const rows = await db()<SignupLinkRow[]>`select * from signup_links`;
  const links = Object.fromEntries(rows.map((r) => [r.kind, toSignupLink(r)])) as Record<SignupLinkKind, SignupLink>;
  if (!links.request || !links.open) throw new Error("Shared links are missing. Run `npm run db:setup`.");
  return links;
}

async function countOpen(sql: Tx) {
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from invitations where source = 'open'`;
  return n;
}

export async function countOpenSignups() {
  return countOpen(db());
}

function stateOf(link: SignupLink, c: string, openCount: number): SignupLinkState {
  if (link.retiredCodes.includes(c)) return "retired";
  if (link.code !== c) return "unknown";
  if (!link.enabled) return "off";
  if (link.kind === "open" && link.limit !== null && openCount >= link.limit) return "full";
  return "active";
}

/** What a visitor sees when they open /request/<code> or /join/<code>. */
export async function resolveSignupLink(kind: SignupLinkKind, c: string): Promise<{ state: SignupLinkState; link: SignupLink }> {
  const link = (await getSignupLinks())[kind];
  const openCount = kind === "open" && link.limit !== null ? await countOpenSignups() : 0;
  return { state: stateOf(link, c, openCount), link };
}

export async function setSignupLinkEnabled(kind: SignupLinkKind, enabled: boolean) {
  await db()`update signup_links set enabled = ${enabled} where kind = ${kind}`;
}

/** Retires the current link for good and issues a new one (left switched off). */
export async function replaceSignupLink(kind: SignupLinkKind) {
  const next = code(kind === "request" ? "ask" : "join");
  await db()`
    update signup_links
    set retired_codes = array_append(retired_codes, code), code = ${next}, enabled = false
    where kind = ${kind}`;
}

export async function updateOpenLink({ events, limit }: { events: EventId[]; limit: number | null }) {
  await db()`update signup_links set events = ${events}::text[], signup_limit = ${limit} where kind = 'open'`;
}

export async function updateRequestLink({ events }: { events: EventId[] }) {
  await db()`update signup_links set events = ${events}::text[] where kind = 'request'`;
}

/** Seats a request gets if the couple approves without adjusting. */
export function defaultSeats(req: JoinRequest, link: SignupLink): Partial<Record<EventId, number>> {
  // No events chosen yet: all events.
  const events = link.events.length ? link.events : wedding.events.map((e) => e.id);
  return Object.fromEntries(events.map((id) => [id, req.partySize]));
}

/** On the guest list already, or waiting on a request. */
async function phoneTaken(sql: Tx, phone: string) {
  const key = phoneKey(phone);
  if (!key) return false;
  const [hit] = await sql`
    select 1 from invitations where phone_key = ${key}
    union all
    select 1 from join_requests where phone_key = ${key} and status = 'pending'
    limit 1`;
  return !!hit;
}

export type CreateResult<T> = { ok: true; value: T } | { ok: false; reason: "closed" | "full" | "duplicate" };

/** Lock the link row so the on/off state, limit and phone checks hold until we insert. */
async function lockLink(tx: Tx, kind: SignupLinkKind) {
  const [row] = await tx<SignupLinkRow[]>`select * from signup_links where kind = ${kind} for update`;
  return toSignupLink(row);
}

export async function createJoinRequest(
  c: string,
  input: { name: string; phone: string; partySize: number; side: string | null; message: string | null },
): Promise<CreateResult<JoinRequest>> {
  try {
    return await db().begin(async (tx): Promise<CreateResult<JoinRequest>> => {
      const link = await lockLink(tx, "request");
      if (stateOf(link, c, 0) !== "active") return { ok: false, reason: "closed" };
      if (await phoneTaken(tx, input.phone)) return { ok: false, reason: "duplicate" };
      const [row] = await tx<JoinRequestRow[]>`
        insert into join_requests (name, phone, phone_key, party_size, side, message)
        values (${input.name}, ${input.phone}, ${phoneKey(input.phone)}, ${input.partySize}, ${input.side}, ${input.message})
        returning *`;
      return { ok: true, value: toJoinRequest(row) };
    });
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "duplicate" };
    throw err;
  }
}

export async function listJoinRequests(status?: RequestStatus, q?: string): Promise<JoinRequest[]> {
  const sql = db();
  const rows = await sql<JoinRequestRow[]>`
    select * from join_requests
    ${status ? sql`where status = ${status}` : sql``}
    order by created_at`; // Oldest first, so nobody waits longest.
  const needle = q?.trim().toLowerCase();
  return rows
    .map(toJoinRequest)
    .filter((r) => !needle || [r.name, r.phone, r.side ?? "", r.message ?? ""].some((v) => v.toLowerCase().includes(needle)));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getJoinRequest(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await db()<JoinRequestRow[]>`select * from join_requests where id = ${id}`;
  return row ? toJoinRequest(row) : null;
}

/** Approving creates a normal personal invitation with the seats the couple set. */
export async function approveJoinRequest(id: string, seats: Partial<Record<EventId, number>>): Promise<Invitation | null> {
  if (!UUID.test(id)) return null;
  try {
    return await db().begin(async (tx) => {
      const [req] = await tx<JoinRequestRow[]>`
        select * from join_requests where id = ${id} and status = 'pending' for update`;
      if (!req) return null;
      const token = newToken(req.name);
      const [row] = await tx<InvitationRow[]>`
        insert into invitations (token, household_name, greeting, phone, phone_key, side, seats, source)
        values (${token}, ${req.name}, ${req.name.split(/\s+/)[0]}, ${req.phone}, ${phoneKey(req.phone) || null},
                ${req.side}, ${tx.json(seats)}, 'request')
        returning ${tx([...invitationColumns])}`;
      await tx`update join_requests set status = 'approved', decided_at = now(), token = ${token} where id = ${id}`;
      return toInvitation(row);
    });
  } catch (err) {
    // Someone with this number was added to the list meanwhile.
    if (isUniqueViolation(err)) return null;
    throw err;
  }
}

export async function declineJoinRequest(id: string) {
  if (!UUID.test(id)) return false;
  const rows = await db()`
    update join_requests set status = 'declined', decided_at = now()
    where id = ${id} and status = 'pending' returning id`;
  return rows.length > 0;
}

/** Open sign-up: one seat per chosen event, confirmed at once. */
export async function registerOpenSignup(
  c: string,
  input: { name: string; phone: string; attending: Partial<Record<EventId, boolean>> },
): Promise<CreateResult<Invitation>> {
  try {
    return await db().begin(async (tx): Promise<CreateResult<Invitation>> => {
      const link = await lockLink(tx, "open");
      const state = stateOf(link, c, link.limit !== null ? await countOpen(tx) : 0);
      if (state === "full") return { ok: false, reason: "full" };
      if (state !== "active") return { ok: false, reason: "closed" };
      if (await phoneTaken(tx, input.phone)) return { ok: false, reason: "duplicate" };

      const seats: Partial<Record<EventId, number>> = {};
      const responses: NonNullable<Invitation["responses"]> = {};
      for (const id of link.events) {
        seats[id] = 1;
        const yes = !!input.attending[id];
        responses[id] = { attending: yes, names: yes ? [input.name] : [] };
      }
      const [row] = await tx<InvitationRow[]>`
        insert into invitations (token, household_name, greeting, phone, phone_key, seats, responses, responded_at, source)
        values (${newToken(input.name)}, ${input.name}, ${input.name.split(/\s+/)[0]}, ${input.phone},
                ${phoneKey(input.phone) || null}, ${tx.json(seats)}, ${tx.json(responses)}, now(), 'open')
        returning ${tx([...invitationColumns])}`;
      return { ok: true, value: toInvitation(row) };
    });
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "duplicate" };
    throw err;
  }
}

/** Events covered by the open link, in wedding order, with their details. */
export async function openLinkEvents(link: SignupLink) {
  const { events } = await getWedding();
  return events.filter((e) => link.events.includes(e.id));
}
