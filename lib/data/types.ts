import type { EventId } from "@/lib/content/wedding";

export type EventResponse = {
  attending: boolean;
  /** One name per seat taken. Empty when not attending. */
  names: string[];
};

export type Invitation = {
  token: string;
  householdName: string;
  /** How the invite greets them, e.g. "Kwame & Ama". Defaults to householdName. */
  greeting?: string;
  phone: string | null;
  side: string | null;
  /** Seats allowed per event. Missing or 0 = not invited to that event. */
  seats: Partial<Record<EventId, number>>;
  responses: Partial<Record<EventId, EventResponse>> | null;
  note: string | null;
  respondedAt: string | null;
  /** Missing = added by the couple ("list"). */
  source?: InviteSource;
};

export type ReplyStatus = "waiting" | "attending" | "declined";

export type Household = Invitation & { status: ReplyStatus };

export type Headcount = {
  eventId: EventId;
  eventName: string;
  invited: number;
  confirmed: number;
  declined: number;
  waiting: number;
};

/** How a household got its invitation. */
export type InviteSource = "list" | "request" | "open";

export type RequestStatus = "pending" | "approved" | "declined";

/** Someone asking for a place through the shared "request" link. */
export type JoinRequest = {
  id: string;
  name: string;
  phone: string;
  /** How many people they asked for, including themselves. */
  partySize: number;
  side: string | null;
  message: string | null;
  status: RequestStatus;
  createdAt: string;
  decidedAt: string | null;
  /** The invitation created when approved. */
  token: string | null;
};

export type SignupLinkKind = "request" | "open";

export type SignupLink = {
  kind: SignupLinkKind;
  /** The secret part of the public URL. "Make a new link" replaces it for good. */
  code: string;
  enabled: boolean;
  /** Open sign-up: events a sign-up gets one seat for. Request: events approved guests get by default. */
  events: EventId[];
  /** Open sign-up only: stop after this many sign-ups. null = no limit. */
  limit: number | null;
  retiredCodes: string[];
};

export type SignupLinkState = "active" | "off" | "retired" | "full" | "unknown";
