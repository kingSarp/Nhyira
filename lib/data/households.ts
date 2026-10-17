import "server-only";
import type { EventId } from "@/lib/content/wedding";
import { newToken, phoneKey } from "./ids";
import { store } from "./mock";
import type { Invitation } from "./types";

// Adding, editing, removing and importing households on the guest list.
// Mock bodies over the in-memory store; Supabase in the backend phase.

export type HouseholdInput = {
  householdName: string;
  greeting: string | null;
  phone: string | null;
  side: string | null;
  seats: Partial<Record<EventId, number>>;
};

/** Another household (other than `except`) already using this phone. */
export async function findByPhone(phone: string | null, except?: string) {
  const key = phoneKey(phone);
  if (!key) return null;
  return store.invitations.find((i) => i.token !== except && phoneKey(i.phone) === key) ?? null;
}

export async function addHousehold(input: HouseholdInput): Promise<Invitation> {
  const inv: Invitation = {
    token: newToken(input.householdName),
    ...input,
    greeting: input.greeting ?? undefined,
    responses: null,
    note: null,
    respondedAt: null,
    source: "list",
    sentAt: null,
  };
  store.invitations.push(inv);
  return inv;
}

export async function updateHousehold(token: string, input: HouseholdInput) {
  const inv = store.invitations.find((i) => i.token === token);
  if (!inv) return null;
  inv.householdName = input.householdName;
  inv.greeting = input.greeting ?? undefined;
  inv.phone = input.phone;
  inv.side = input.side;
  inv.seats = input.seats;
  // Fewer seats than names already given: keep the first ones; dropped events lose their answer.
  if (inv.responses) {
    for (const id of Object.keys(inv.responses) as EventId[]) {
      const allowed = input.seats[id] ?? 0;
      const r = inv.responses[id];
      if (!r) continue;
      if (allowed === 0) delete inv.responses[id];
      else r.names = r.names.slice(0, allowed);
    }
  }
  return inv;
}

export async function removeHousehold(token: string) {
  const i = store.invitations.findIndex((x) => x.token === token);
  if (i === -1) return false;
  store.invitations.splice(i, 1);
  return true;
}

export async function addHouseholds(inputs: HouseholdInput[]) {
  const added: Invitation[] = [];
  for (const input of inputs) added.push(await addHousehold(input));
  return added;
}

export async function markSent(token: string) {
  const inv = store.invitations.find((i) => i.token === token);
  if (inv) inv.sentAt = new Date().toISOString();
  return inv ?? null;
}
