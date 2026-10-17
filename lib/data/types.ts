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
