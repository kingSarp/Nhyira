import "server-only";
import type { EventId } from "@/lib/content/wedding";
import type { Invitation, InviteSource, JoinRequest, RequestStatus, SignupLink, SignupLinkKind } from "./types";

// Database rows → the app's types. Column names are snake_case in Postgres.

export type InvitationRow = {
  token: string;
  household_name: string;
  greeting: string | null;
  phone: string | null;
  side: string | null;
  seats: Invitation["seats"];
  responses: Invitation["responses"];
  note: string | null;
  responded_at: Date | null;
  source: InviteSource;
  sent_at: Date | null;
};

export type JoinRequestRow = {
  id: string;
  name: string;
  phone: string;
  party_size: number;
  side: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: Date;
  decided_at: Date | null;
  token: string | null;
};

export type SignupLinkRow = {
  kind: SignupLinkKind;
  code: string;
  enabled: boolean;
  events: string[];
  signup_limit: number | null;
  retired_codes: string[];
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export const invitationColumns = [
  "token",
  "household_name",
  "greeting",
  "phone",
  "side",
  "seats",
  "responses",
  "note",
  "responded_at",
  "source",
  "sent_at",
] as const;

export function toInvitation(r: InvitationRow): Invitation {
  return {
    token: r.token,
    householdName: r.household_name,
    greeting: r.greeting ?? undefined,
    phone: r.phone,
    side: r.side,
    seats: r.seats ?? {},
    responses: r.responses,
    note: r.note,
    respondedAt: iso(r.responded_at),
    source: r.source,
    sentAt: iso(r.sent_at),
  };
}

export function toJoinRequest(r: JoinRequestRow): JoinRequest {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    partySize: r.party_size,
    side: r.side,
    message: r.message,
    status: r.status,
    createdAt: r.created_at.toISOString(),
    decidedAt: iso(r.decided_at),
    token: r.token,
  };
}

export function toSignupLink(r: SignupLinkRow): SignupLink {
  return {
    kind: r.kind,
    code: r.code,
    enabled: r.enabled,
    events: r.events as EventId[],
    limit: r.signup_limit,
    retiredCodes: r.retired_codes,
  };
}
