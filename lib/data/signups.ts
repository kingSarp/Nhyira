import "server-only";
import { randomBytes } from "node:crypto";
import { wedding, type EventId } from "@/lib/content/wedding";
import { toWhatsAppNumber } from "@/lib/format";
import { store } from "./mock";
import type { Invitation, JoinRequest, RequestStatus, SignupLink, SignupLinkKind, SignupLinkState } from "./types";

// Shared links (request a place, open one-seat sign-up) and join requests.
// Mock bodies over the in-memory store; Supabase in the backend phase.

function code(prefix: string) {
  return `${prefix}-${randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x")}`;
}

function newToken(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${slug || "guest"}-${randomBytes(6).toString("hex")}`;
}

/** Normalised number used to stop the same phone registering twice. */
function phoneKey(phone: string | null | undefined) {
  return toWhatsAppNumber(phone) ?? "";
}

export async function getSignupLinks(): Promise<Record<SignupLinkKind, SignupLink>> {
  return store.links;
}

export async function countOpenSignups() {
  return store.invitations.filter((i) => i.source === "open").length;
}

/** What a visitor sees when they open /request/<code> or /join/<code>. */
export async function resolveSignupLink(kind: SignupLinkKind, c: string): Promise<{ state: SignupLinkState; link: SignupLink }> {
  const link = store.links[kind];
  if (link.retiredCodes.includes(c)) return { state: "retired", link };
  if (link.code !== c) return { state: "unknown", link };
  if (!link.enabled) return { state: "off", link };
  if (kind === "open" && link.limit !== null && (await countOpenSignups()) >= link.limit) return { state: "full", link };
  return { state: "active", link };
}

export async function setSignupLinkEnabled(kind: SignupLinkKind, enabled: boolean) {
  store.links[kind].enabled = enabled;
}

/** Retires the current link for good and issues a new one (left switched off). */
export async function replaceSignupLink(kind: SignupLinkKind) {
  const link = store.links[kind];
  link.retiredCodes.push(link.code);
  link.code = code(kind === "request" ? "ask" : "join");
  link.enabled = false;
}

export async function updateOpenLink({ events, limit }: { events: EventId[]; limit: number | null }) {
  store.links.open.events = events;
  store.links.open.limit = limit;
}

export async function updateRequestLink({ events }: { events: EventId[] }) {
  store.links.request.events = events;
}

/** Seats a request gets if the couple approves without adjusting. */
export function defaultSeats(req: JoinRequest, link: SignupLink): Partial<Record<EventId, number>> {
  return Object.fromEntries(link.events.map((id) => [id, req.partySize]));
}

function phoneTaken(phone: string) {
  const key = phoneKey(phone);
  if (!key) return false;
  return (
    store.invitations.some((i) => phoneKey(i.phone) === key) ||
    store.requests.some((r) => r.status === "pending" && phoneKey(r.phone) === key)
  );
}

export type CreateResult<T> = { ok: true; value: T } | { ok: false; reason: "closed" | "full" | "duplicate" };

export async function createJoinRequest(
  c: string,
  input: { name: string; phone: string; partySize: number; side: string | null; message: string | null },
): Promise<CreateResult<JoinRequest>> {
  const { state } = await resolveSignupLink("request", c);
  if (state !== "active") return { ok: false, reason: "closed" };
  if (phoneTaken(input.phone)) return { ok: false, reason: "duplicate" };
  const req: JoinRequest = {
    id: `req-${randomBytes(4).toString("hex")}`,
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedAt: null,
    token: null,
  };
  store.requests.push(req);
  return { ok: true, value: req };
}

export async function listJoinRequests(status?: RequestStatus, q?: string): Promise<JoinRequest[]> {
  const needle = q?.trim().toLowerCase();
  return store.requests
    .filter((r) => !status || r.status === status)
    .filter((r) => !needle || [r.name, r.phone, r.side ?? "", r.message ?? ""].some((v) => v.toLowerCase().includes(needle)))
    // Oldest first, so nobody waits longest.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getJoinRequest(id: string) {
  return store.requests.find((r) => r.id === id) ?? null;
}

/** Approving creates a normal personal invitation with the seats the couple set. */
export async function approveJoinRequest(id: string, seats: Partial<Record<EventId, number>>): Promise<Invitation | null> {
  const req = store.requests.find((r) => r.id === id && r.status === "pending");
  if (!req) return null;
  const inv: Invitation = {
    token: newToken(req.name),
    householdName: req.name,
    greeting: req.name.split(/\s+/)[0],
    phone: req.phone,
    side: req.side,
    seats,
    responses: null,
    note: null,
    respondedAt: null,
    source: "request",
  };
  store.invitations.push(inv);
  req.status = "approved";
  req.decidedAt = new Date().toISOString();
  req.token = inv.token;
  return inv;
}

export async function declineJoinRequest(id: string) {
  const req = store.requests.find((r) => r.id === id && r.status === "pending");
  if (!req) return false;
  req.status = "declined";
  req.decidedAt = new Date().toISOString();
  return true;
}

/** Open sign-up: one seat per chosen event, confirmed at once. */
export async function registerOpenSignup(
  c: string,
  input: { name: string; phone: string; attending: Partial<Record<EventId, boolean>> },
): Promise<CreateResult<Invitation>> {
  const { state, link } = await resolveSignupLink("open", c);
  if (state === "full") return { ok: false, reason: "full" };
  if (state !== "active") return { ok: false, reason: "closed" };
  if (phoneTaken(input.phone)) return { ok: false, reason: "duplicate" };

  const seats: Partial<Record<EventId, number>> = {};
  const responses: Invitation["responses"] = {};
  for (const id of link.events) {
    seats[id] = 1;
    const yes = !!input.attending[id];
    responses[id] = { attending: yes, names: yes ? [input.name] : [] };
  }
  const inv: Invitation = {
    token: newToken(input.name),
    householdName: input.name,
    greeting: input.name.split(/\s+/)[0],
    phone: input.phone,
    side: null,
    seats,
    responses,
    note: null,
    respondedAt: new Date().toISOString(),
    source: "open",
  };
  store.invitations.push(inv);
  return { ok: true, value: inv };
}

/** Events covered by the open link, in wedding order. */
export function openLinkEvents(link: SignupLink) {
  return wedding.events.filter((e) => link.events.includes(e.id));
}
