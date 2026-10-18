import type { EventDef, EventId } from "@/lib/content/wedding";
import type { EventResponse } from "@/lib/data/types";

// RSVP form contract, shared by the form (field names) and the server action
// (parsing and validation). Field names:
//   attending_<eventId> = "yes" | "no"
//   names_<eventId>     = one input per seat, in order
//   note                = optional message

export type RsvpEvent = Pick<EventDef, "id" | "name"> & { seats: number };

export type RsvpValues = {
  answers: Partial<Record<EventId, "yes" | "no">>;
  names: Partial<Record<EventId, string[]>>;
  note: string;
};

export type RsvpErrors = {
  /** Field id → message shown under the field. */
  fields: Record<string, string>;
  /** In page order, for the summary at the top of the form. */
  summary: { href: string; text: string }[];
};

export type RsvpState =
  | { status: "idle" }
  | { status: "invalid"; values: RsvpValues; errors: RsvpErrors }
  | { status: "failed"; values: RsvpValues; message: string };

export const fieldId = {
  event: (id: EventId) => `rsvp-${id}`,
  seat: (id: EventId, index: number) => `rsvp-${id}-guest-${index + 1}`,
  note: "rsvp-note",
};

const NAME_MAX = 80;
export const NOTE_MAX = 500;

export function parseRsvp(form: FormData, events: RsvpEvent[]): RsvpValues {
  const values: RsvpValues = { answers: {}, names: {}, note: String(form.get("note") ?? "").slice(0, NOTE_MAX) };
  for (const e of events) {
    const a = form.get(`attending_${e.id}`);
    if (a === "yes" || a === "no") values.answers[e.id] = a;
    values.names[e.id] = form
      .getAll(`names_${e.id}`)
      .map((n) => String(n).trim().slice(0, NAME_MAX))
      .slice(0, e.seats);
  }
  return values;
}

export function validateRsvp(values: RsvpValues, events: RsvpEvent[]): RsvpErrors | null {
  const fields: RsvpErrors["fields"] = {};
  const summary: RsvpErrors["summary"] = [];

  for (const e of events) {
    const answer = values.answers[e.id];
    if (!answer) {
      fields[fieldId.event(e.id)] = "Choose an answer for this event.";
      summary.push({ href: `#${fieldId.event(e.id)}`, text: `${e.name}: choose an answer` });
      continue;
    }
    if (answer === "no") continue;

    const names = values.names[e.id] ?? [];
    if (names.length === 0) names.push("");
    names.forEach((name, i) => {
      if (name) return;
      const id = fieldId.seat(e.id, i);
      fields[id] = i === 0 ? "Enter the name of who is coming." : "Enter a name, or remove this seat.";
      summary.push({
        href: `#${id}`,
        text: i === 0 ? `${e.name}: add who is coming` : `${e.name}: name guest ${i + 1}, or remove the seat`,
      });
    });
  }

  return summary.length ? { fields, summary } : null;
}

export function toResponses(values: RsvpValues, events: RsvpEvent[]) {
  const responses: Partial<Record<EventId, EventResponse>> = {};
  for (const e of events) {
    const attending = values.answers[e.id] === "yes";
    responses[e.id] = { attending, names: attending ? (values.names[e.id] ?? []).filter(Boolean) : [] };
  }
  return responses;
}

const counts = ["One thing", "Two things", "Three things", "Four things", "Five things", "Six things"];
export function summaryTitle(n: number) {
  return `${counts[n - 1] ?? `${n} things`} to finish`;
}
