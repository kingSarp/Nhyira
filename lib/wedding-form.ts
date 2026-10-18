import { EVENTS, MAX_PROGRAMME, PHOTO_FOCUS, type DressColour, type EventDetails, type EventId, type PhotoFocus, type WeddingDetails } from "@/lib/content/wedding";
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

/** The fields saved by the main details form (photos are saved separately). */
export type DetailsText = Omit<WeddingDetails, "story" | "couplePhoto" | "couplePhotoFocus">;

/** State of a photo upload form (main photo or a story slot). */
export type PhotoFormState =
  | { status: "idle" }
  | { status: "saved"; at: number }
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
  for (let i = 0; i < MAX_PROGRAMME; i++) {
    v[`programme${i}_name`] = d.programme[i]?.name ?? "";
    v[`programme${i}_time`] = d.programme[i]?.time ?? "";
  }
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
  details: DetailsText | null;
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
    // Everything happens on the wedding day.
    const eDate = date;
    const time = field(`${e.id}_time`, 20);
    const venue = field(`${e.id}_venue`);
    if (!venue) add(errors, `${e.id}_venue`, "Enter the venue's address.");
    const mapUrl = field(`${e.id}_mapUrl`, 500);
    if (mapUrl && !/^https:\/\/\S+$/.test(mapUrl)) add(errors, `${e.id}_mapUrl`, "The map link must start with https://");

    const dressColours: DressColour[] = [];
    for (let i = 0; i < MAX_COLOURS; i++) {
      const name = field(`${e.id}_colour${i}_name`, 30);
      const hex = field(`${e.id}_colour${i}_hex`, 7);
      if (!name) continue;
      if (!HEX.test(hex)) add(errors, `${e.id}_colour${i}_hex`, `Pick a colour for “${name}”.`);
      else dressColours.push({ name, hex: hex.toUpperCase() });
    }
    events[e.id] = { date: eDate, time, venue, mapUrl, dressColours };
  }

  const programme = [];
  for (let i = 0; i < MAX_PROGRAMME; i++) {
    const name = field(`programme${i}_name`, 40);
    const time = field(`programme${i}_time`, 20);
    if (name) programme.push({ name, time });
    else if (time) add(errors, `programme${i}_name`, `Programme: name the part of the day at ${time}.`);
  }

  if (errors.summary.length) return { values, errors, details: null };
  return {
    values,
    errors: null,
    details: { partners: [partnerA, partnerB], date, city, rsvpDeadline, contact: { name: contactName, phone: contactPhone }, events, programme },
  };
}

/** The main photo's "keep in view" choice. */
export function parsePhotoFocus(form: FormData): PhotoFocus {
  const f = String(form.get("focus") ?? "");
  return f in PHOTO_FOCUS ? (f as PhotoFocus) : "center";
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
