import type { EventId } from "@/lib/content/wedding";
import { toWhatsAppNumber } from "@/lib/format";

// Field names, parsing and validation for the two public sign-up forms.
// Shared by the client forms (field ids) and the server actions.

export type FormErrors = { fields: Record<string, string>; summary: { href: string; text: string }[] };

export type SignupState =
  | { status: "idle" }
  | { status: "invalid"; values: Record<string, string>; errors: FormErrors }
  | { status: "failed"; values: Record<string, string>; message: string };

export const MAX_PARTY = 6;

function add(errors: FormErrors, id: string, field: string, summary: string) {
  errors.fields[id] = field;
  errors.summary.push({ href: `#${id}`, text: summary });
}

function checkPerson(values: Record<string, string>, errors: FormErrors) {
  if (values.name.length < 2) add(errors, "name", "Enter your full name.", "Enter your full name");
  if (!values.phone) add(errors, "phone", "Enter your phone number.", "Enter your phone number");
  else if (!toWhatsAppNumber(values.phone)) add(errors, "phone", "Enter a phone number like 024 123 4567.", "Check your phone number");
}

export function parseRequest(form: FormData) {
  const values = {
    name: String(form.get("name") ?? "").trim().slice(0, 80),
    phone: String(form.get("phone") ?? "").trim().slice(0, 20),
    partySize: String(form.get("partySize") ?? ""),
    side: String(form.get("side") ?? "").trim().slice(0, 80),
    message: String(form.get("message") ?? "").trim().slice(0, 500),
  };
  const errors: FormErrors = { fields: {}, summary: [] };
  checkPerson(values, errors);
  const n = Number(values.partySize);
  if (!Number.isInteger(n) || n < 1 || n > MAX_PARTY) add(errors, "partySize", "Choose how many people.", "Choose how many people");
  return { values, errors: errors.summary.length ? errors : null, partySize: n };
}

export function parseOpenSignup(form: FormData, events: { id: EventId; name: string }[]) {
  const values: Record<string, string> = {
    name: String(form.get("name") ?? "").trim().slice(0, 80),
    phone: String(form.get("phone") ?? "").trim().slice(0, 20),
  };
  const errors: FormErrors = { fields: {}, summary: [] };
  checkPerson(values, errors);
  const attending: Partial<Record<EventId, boolean>> = {};
  for (const e of events) {
    const a = String(form.get(`attending_${e.id}`) ?? "");
    values[`attending_${e.id}`] = a;
    if (a !== "yes" && a !== "no") add(errors, `event-${e.id}`, "Choose an answer for this event.", `${e.name}: choose an answer`);
    else attending[e.id] = a === "yes";
  }
  if (!errors.summary.length && !Object.values(attending).some(Boolean)) {
    add(errors, `event-${events[0]?.id}`, "Choose at least one event you can attend.", "Choose at least one event");
  }
  return { values, errors: errors.summary.length ? errors : null, attending };
}

export const duplicateMessage =
  "This number already has an invitation or a request. Check your WhatsApp messages for your link.";
