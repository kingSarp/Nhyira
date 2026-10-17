"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { wedding, type EventId } from "@/lib/content/wedding";
import {
  approveJoinRequest,
  declineJoinRequest,
  getOrganiser,
  replaceSignupLink,
  setSignupLinkEnabled,
  updateOpenLink,
  type SignupLinkKind,
} from "@/lib/data";

async function requireOrganiser() {
  // Backend phase: a real session check against the allowed emails.
  if (!(await getOrganiser())) redirect("/login");
}

const MAX_SEATS = 10;

export async function approveRequest(id: string, form: FormData) {
  await requireOrganiser();
  const seats: Partial<Record<EventId, number>> = {};
  for (const e of wedding.events) {
    const n = Math.max(0, Math.min(MAX_SEATS, Math.floor(Number(form.get(`seats_${e.id}`) ?? 0))));
    if (n > 0) seats[e.id] = n;
  }
  if (Object.keys(seats).length === 0) redirect(`/admin/requests?error=${id}`);
  const inv = await approveJoinRequest(id, seats);
  revalidatePath("/admin", "layout");
  redirect(inv ? `/admin/requests?approved=${id}` : "/admin/requests");
}

export async function declineRequest(id: string) {
  await requireOrganiser();
  await declineJoinRequest(id);
  revalidatePath("/admin", "layout");
  redirect("/admin/requests");
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
