import { EVENTS, type DressColour, type EventDetails, type EventId, type WeddingDetails } from "@/lib/content/wedding";
import { toWhatsAppNumber } from "@/lib/format";
import type { FormErrors } from "@/lib/signup-forms";

// Field names, parsing and validation for /admin/details. Shared by the
// client forms (field names) and the server actions.

export const MAX_COLOURS = 3;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export type DetailsFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "invalid"; values: Record<string, string>; errors: FormErrors };

export type StoryFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "invalid"; values: Record<string, string>; errors: FormErrors }
  | { status: "failed"; values: Record<string, string>; message: string };

/** The editable text fields as flat form values, for the form's defaults. */
export function detailsToValues(d: WeddingDetails): Record<string, string> {
  const v: Record<string, string> = {
    partnerA: d.partners[0],
    partnerB: d.partners[1],
    date: d.date,
    city: d.city,
    rsvpDeadline: d.rsvpDeadline,
    contactName: d.contact.name,
    contactPhone: d.contact.phone,
  };
  for (const { id } of EVENTS) {
    const e = d.events[id];
    v[`${id}_date`] = e.date;
    v[`${id}_time`] = e.time;
    v[`${id}_venue`] = e.venue;
    v[`${id}_mapUrl`] = e.mapUrl;
    for (let i = 0; i < MAX_COLOURS; i++) {
      v[`${id}_colour${i}_name`] = e.dressColours[i]?.name ?? "";
      v[`${id}_colour${i}_hex`] = e.dressColours[i]?.hex ?? "#C9A27E";
    }
  }
  return v;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const validDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());

function add(errors: FormErrors, id: string, message: string) {
  if (errors.fields[id]) return;
  errors.fields[id] = message;
  errors.summary.push({ href: `#${id}`, text: message });
}

/**
 * Form → the text fields of WeddingDetails (everything but the story photos),
 * or errors keyed by field id.
 */
export function parseDetailsForm(form: FormData): {
  values: Record<string, string>;
  errors: FormErrors | null;
  details: Omit<WeddingDetails, "story"> | null;
} {
  const get = (k: string, max = 120) => String(form.get(k) ?? "").trim().slice(0, max);
  const values: Record<string, string> = {};
  const errors: FormErrors = { fields: {}, summary: [] };
  const field = (k: string, max?: number) => (values[k] = get(k, max));

  const partnerA = field("partnerA", 40);
  const partnerB = field("partnerB", 40);
  if (!partnerA) add(errors, "partnerA", "Enter the first partner's name.");
  if (!partnerB) add(errors, "partnerB", "Enter the second partner's name.");

  const date = field("date", 10);
  if (!validDate(date)) add(errors, "date", "Enter the wedding date.");
  const city = field("city", 60);
  if (!city) add(errors, "city", "Enter the city, e.g. Accra, Ghana.");

  const rsvpDeadline = field("rsvpDeadline", 10);
  if (!validDate(rsvpDeadline)) add(errors, "rsvpDeadline", "Enter the last day guests can reply.");
  else if (validDate(date) && rsvpDeadline > date) add(errors, "rsvpDeadline", "The reply deadline must be on or before the wedding date.");

  const contactName = field("contactName", 40);
  const contactPhone = field("contactPhone", 20);
  if (!contactName) add(errors, "contactName", "Enter who guests should contact with questions.");
  if (contactPhone && !toWhatsAppNumber(contactPhone)) add(errors, "contactPhone", "Enter a phone number like 024 123 4567.");

  const events = {} as Record<EventId, EventDetails>;
  for (const e of EVENTS) {
    const eDate = field(`${e.id}_date`, 10);
    if (!validDate(eDate)) add(errors, `${e.id}_date`, `${e.shortName}: enter the date.`);
    const time = field(`${e.id}_time`, 20);
    const venue = field(`${e.id}_venue`);
    if (!venue) add(errors, `${e.id}_venue`, `${e.shortName}: enter the venue.`);
    const mapUrl = field(`${e.id}_mapUrl`, 500);
    if (mapUrl && !/^https:\/\/\S+$/.test(mapUrl)) add(errors, `${e.id}_mapUrl`, `${e.shortName}: the map link must start with https://`);

    const dressColours: DressColour[] = [];
    for (let i = 0; i < MAX_COLOURS; i++) {
      const name = field(`${e.id}_colour${i}_name`, 30);
      const hex = field(`${e.id}_colour${i}_hex`, 7);
      if (!name) continue;
      if (!HEX.test(hex)) add(errors, `${e.id}_colour${i}_hex`, `${e.shortName}: pick a colour for “${name}”.`);
      else dressColours.push({ name, hex: hex.toUpperCase() });
    }
    events[e.id] = { date: eDate, time, venue, mapUrl, dressColours };
  }

  if (errors.summary.length) return { values, errors, details: null };
  return {
    values,
    errors: null,
    details: { partners: [partnerA, partnerB], date, city, rsvpDeadline, contact: { name: contactName, phone: contactPhone }, events },
  };
}

/** Year and caption for one story slot. */
export function parseStoryText(form: FormData, slot: number) {
  const values = {
    year: String(form.get("year") ?? "").trim().slice(0, 10),
    caption: String(form.get("caption") ?? "").trim().slice(0, 40),
  };
  const errors: FormErrors = { fields: {}, summary: [] };
  if (!values.caption) add(errors, `story${slot}_caption`, "Add a short caption, e.g. “Where it began”.");
  return { values, errors: errors.summary.length ? errors : null };
}
