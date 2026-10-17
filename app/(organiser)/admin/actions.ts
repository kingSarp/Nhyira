"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { wedding, type EventId } from "@/lib/content/wedding";
import {
  approveJoinRequest,
  declineJoinRequest,
  defaultSeats,
  getJoinRequest,
  getOrganiser,
  getSignupLinks,
  replaceSignupLink,
  setSignupLinkEnabled,
  updateOpenLink,
  updateRequestLink,
  type SignupLinkKind,
} from "@/lib/data";

async function requireOrganiser() {
  // Backend phase: a real session check against the allowed emails.
  if (!(await getOrganiser())) redirect("/login");
}

const MAX_SEATS = 10;

/** Seats for one request: the "Adjust seats" inputs if sent, else the defaults. */
async function seatsFor(id: string, form: FormData) {
  const req = await getJoinRequest(id);
  if (!req) return null;
  const links = await getSignupLinks();
  const seats: Partial<Record<EventId, number>> = {};
  for (const e of wedding.events) {
    const raw = form.get(`seats_${id}_${e.id}`);
    const n = raw === null ? (defaultSeats(req, links.request)[e.id] ?? 0) : Math.floor(Number(raw));
    const clamped = Math.max(0, Math.min(MAX_SEATS, Number.isFinite(n) ? n : 0));
    if (clamped > 0) seats[e.id] = clamped;
  }
  return seats;
}

async function approveMany(ids: string[], form: FormData) {
  const done: string[] = [];
  for (const id of ids) {
    const seats = await seatsFor(id, form);
    if (!seats || Object.keys(seats).length === 0) continue;
    if (await approveJoinRequest(id, seats)) done.push(id);
  }
  revalidatePath("/admin", "layout");
  redirect(done.length ? `/admin/requests?approved=${done.join(",")}` : "/admin/requests?error=seats");
}

async function declineMany(ids: string[]) {
  for (const id of ids) await declineJoinRequest(id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/requests?declined=${ids.length}`);
}

const selected = (form: FormData) => form.getAll("ids").map(String);

export async function approveRequest(id: string, form: FormData) {
  await requireOrganiser();
  await approveMany([id], form);
}

export async function declineRequest(id: string) {
  await requireOrganiser();
  await declineMany([id]);
}

export async function approveSelected(form: FormData) {
  await requireOrganiser();
  const ids = selected(form);
  if (!ids.length) redirect("/admin/requests?error=none");
  await approveMany(ids, form);
}

export async function declineSelected(form: FormData) {
  await requireOrganiser();
  const ids = selected(form);
  if (!ids.length) redirect("/admin/requests?error=none");
  await declineMany(ids);
}

export async function saveRequestLink(form: FormData) {
  await requireOrganiser();
  const events = wedding.events.map((e) => e.id).filter((id) => form.get(`event_${id}`) === "on");
  if (events.length === 0) redirect("/admin/links?error=request-events");
  await updateRequestLink({ events });
  revalidatePath("/admin/links");
  redirect("/admin/links?saved=request");
}

export async function toggleLink(kind: SignupLinkKind, enabled: boolean) {
  await requireOrganiser();
  await setSignupLinkEnabled(kind, enabled);
  revalidatePath("/admin/links");
  redirect("/admin/links");
}

export async function replaceLink(kind: SignupLinkKind) {
  await requireOrganiser();
  await replaceSignupLink(kind);
  revalidatePath("/admin/links");
  redirect(`/admin/links?replaced=${kind}`);
}

export async function saveOpenLink(form: FormData) {
  await requireOrganiser();
  const events = wedding.events.map((e) => e.id).filter((id) => form.get(`event_${id}`) === "on");
  const raw = String(form.get("limit") ?? "").trim();
  const limit = raw === "" ? null : Math.max(1, Math.floor(Number(raw)) || 1);
  if (events.length === 0) redirect("/admin/links?error=events");
  await updateOpenLink({ events, limit });
  revalidatePath("/admin/links");
  redirect("/admin/links?saved=open");
}
