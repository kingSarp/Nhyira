import "server-only";
import type { EventId } from "@/lib/content/wedding";
import { db } from "@/lib/db";
import { newToken, phoneKey } from "./ids";
import { invitationColumns, toInvitation, type InvitationRow } from "./rows";
import type { Invitation } from "./types";

// Adding, editing, removing and importing households on the guest list.

export type HouseholdInput = {
  householdName: string;
  greeting: string | null;
  phone: string | null;
  side: string | null;
  seats: Partial<Record<EventId, number>>;
};

/** Another household (other than `except`) already using this phone. */
export async function findByPhone(phone: string | null, except?: string): Promise<Invitation | null> {
  const key = phoneKey(phone);
  if (!key) return null;
  const sql = db();
  const [row] = await sql<InvitationRow[]>`
    select ${sql([...invitationColumns])} from invitations
    where phone_key = ${key} and token <> ${except ?? ""}`;
  return row ? toInvitation(row) : null;
}

function insertRow(input: HouseholdInput) {
  return {
    token: newToken(input.householdName),
    household_name: input.householdName,
    greeting: input.greeting,
    phone: input.phone,
    phone_key: phoneKey(input.phone) || null,
    side: input.side,
    seats: input.seats,
    source: "list",
  };
}

export async function addHousehold(input: HouseholdInput): Promise<Invitation> {
  const [inv] = await addHouseholds([input]);
  return inv;
}

/** All or nothing: one transaction, so a failed import adds no one. */
export async function addHouseholds(inputs: HouseholdInput[]): Promise<Invitation[]> {
  if (!inputs.length) return [];
  const sql = db();
  return sql.begin(async (tx) => {
    const added: Invitation[] = [];
    for (const input of inputs) {
      const r = insertRow(input);
      const [row] = await tx<InvitationRow[]>`
        insert into invitations (token, household_name, greeting, phone, phone_key, side, seats, source)
        values (${r.token}, ${r.household_name}, ${r.greeting}, ${r.phone}, ${r.phone_key}, ${r.side}, ${tx.json(r.seats)}, ${r.source})
        returning ${tx([...invitationColumns])}`;
      added.push(toInvitation(row));
    }
    return added;
  });
}

export async function updateHousehold(token: string, input: HouseholdInput): Promise<Invitation | null> {
  const sql = db();
  return sql.begin(async (tx) => {
    const [row] = await tx<InvitationRow[]>`
      select ${tx([...invitationColumns])} from invitations where token = ${token} for update`;
    if (!row) return null;
    // Fewer seats than names already given: keep the first ones; dropped events lose their answer.
    let responses = row.responses;
    if (responses) {
      responses = { ...responses };
      for (const id of Object.keys(responses) as EventId[]) {
        const allowed = input.seats[id] ?? 0;
        const r = responses[id];
        if (!r) continue;
        if (allowed === 0) delete responses[id];
        else responses[id] = { ...r, names: r.names.slice(0, allowed) };
      }
    }
    const [updated] = await tx<InvitationRow[]>`
      update invitations set
        household_name = ${input.householdName},
        greeting = ${input.greeting},
        phone = ${input.phone},
        phone_key = ${phoneKey(input.phone) || null},
        side = ${input.side},
        seats = ${tx.json(input.seats)},
        responses = ${responses ? tx.json(responses) : null}
      where token = ${token}
      returning ${tx([...invitationColumns])}`;
    return toInvitation(updated);
  });
}

export async function removeHousehold(token: string) {
  const rows = await db()`delete from invitations where token = ${token} returning token`;
  return rows.length > 0;
}

export async function markSent(token: string): Promise<Invitation | null> {
  const sql = db();
  const [row] = await sql<InvitationRow[]>`
    update invitations set sent_at = now() where token = ${token}
    returning ${sql([...invitationColumns])}`;
  return row ? toInvitation(row) : null;
}
