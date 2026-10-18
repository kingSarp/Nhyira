"use server";

import { redirect } from "next/navigation";
import { checkIn, findGuests, getStaff, isComing, peopleFor, undoCheckIn, type Invitation } from "@/lib/data";
import { tokenFromScan, type CheckInView, type GuestHit } from "@/lib/checkin";

async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/login");
  return staff;
}

const declined = (inv: Invitation) => !!inv.respondedAt && !isComing(inv);

/** Checks in the guest on a scanned pass (or a tapped search result). */
export async function checkInGuest(scanned: string): Promise<CheckInView> {
  const staff = await requireStaff();
  const token = tokenFromScan(scanned);
  if (!token) return { status: "invalid" };
  const r = await checkIn(token, staff.email);
  if (r.status === "unknown") return r;
  const inv = r.invitation;
  const details = {
    token: inv.token,
    name: inv.greeting ?? inv.householdName,
    people: peopleFor(inv),
    at: inv.checkedInAt!,
    by: inv.checkedInBy ?? null,
    declined: declined(inv),
  };
  return r.status === "checked-in" ? { status: "checked-in", ...details } : { status: "already", ...details };
}

export async function undoGuest(token: string) {
  await requireStaff();
  await undoCheckIn(token);
}

export async function searchGuests(query: string): Promise<GuestHit[]> {
  await requireStaff();
  return (await findGuests(query)).map((inv) => ({
    token: inv.token,
    name: inv.householdName,
    phoneEnd: inv.phone ? inv.phone.replace(/\D/g, "").slice(-3) : null,
    people: peopleFor(inv),
    checkedInAt: inv.checkedInAt ?? null,
    declined: declined(inv),
  }));
}
