import {
  EVENTS,
  MAX_PROGRAMME,
  PHOTO_FOCUS,
  STORY_SLOTS,
  defaultDetails,
  wedding,
  type EventDef,
  type EventDetails,
  type PhotoFocus,
  type ProgrammeItem,
  type StoryPhoto,
  type UploadedPhoto,
  type WeddingDetails,
} from "@/lib/content/wedding";

// Turns the stored details into what screens use. Pure, so it runs anywhere;
// screens get the result from getWedding() in "@/lib/data".

export type WeddingEvent = EventDef & EventDetails;
export type Img = { src: string; alt: string; focus?: string };

export type Wedding = {
  details: WeddingDetails;
  partners: readonly [string, string];
  /** "Kay & Ama" */
  coupleNames: string;
  monogram: readonly [string, string];
  date: string;
  city: string;
  /** The exact moment replies close (end of the deadline day, Accra time). */
  rsvpClosesAt: Date;
  rsvpDeadline: string;
  contact: { name: string; phone: string };
  events: WeddingEvent[];
  /** Parts of the day with a name, in order. */
  programme: ProgrammeItem[];
  /** Filled slots only, in order. The story section shows when all four are filled. */
  story: (StoryPhoto & { alt: string; focus: string })[];
  images: { couple: Img & { focus: string }; roseBreak: Img };
  /** Changes whenever the WhatsApp card would look different; part of the card's URL so caches never serve an old one. */
  cardVersion: string;
};

/** Google Maps search for a venue. */
export function mapUrlFor(venue: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(venue)}`;
}

/** Accra is on GMT all year, so the end of the day there is 23:59:59Z. */
export function endOfDayInAccra(isoDate: string) {
  return new Date(`${isoDate}T23:59:59Z`);
}

/** "Time TBC" when the time hasn't been set. */
export function displayTime(time: string) {
  return time.trim() || "Time TBC";
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const photo = (v: unknown): UploadedPhoto | null =>
  isRecord(v) && typeof v.src === "string" && typeof v.path === "string" ? { src: v.src, path: v.path } : null;

/** FNV-1a, base 36. Short and stable; not for security. */
export function shortHash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

/**
 * Stored JSON → WeddingDetails. Missing or malformed fields fall back to the
 * defaults, so adding a field later never breaks an existing row.
 */
export function normaliseDetails(raw: unknown): WeddingDetails {
  const d = defaultDetails;
  if (!isRecord(raw)) return d;
  const partners = Array.isArray(raw.partners) ? raw.partners : [];
  const contact = isRecord(raw.contact) ? raw.contact : {};
  const events = isRecord(raw.events) ? raw.events : {};
  const story = Array.isArray(raw.story) ? raw.story : [];

  return {
    partners: [str(partners[0], d.partners[0]), str(partners[1], d.partners[1])],
    date: str(raw.date, d.date),
    city: str(raw.city, d.city),
    rsvpDeadline: str(raw.rsvpDeadline, d.rsvpDeadline),
    contact: { name: str(contact.name, d.contact.name), phone: str(contact.phone, d.contact.phone) },
    events: Object.fromEntries(
      EVENTS.map(({ id }) => {
        const e = isRecord(events[id]) ? events[id] : {};
        const fallback = d.events[id];
        const colours = Array.isArray(e.dressColours)
          ? e.dressColours.filter(isRecord).map((c) => ({ name: str(c.name, ""), hex: str(c.hex, "#000000") }))
          : fallback.dressColours;
        return [
          id,
          {
            date: str(e.date, fallback.date),
            time: str(e.time, fallback.time),
            venue: str(e.venue, fallback.venue),
            mapUrl: str(e.mapUrl, fallback.mapUrl),
            dressColours: colours,
          },
        ];
      }),
    ) as WeddingDetails["events"],
    programme: Array.isArray(raw.programme)
      ? raw.programme
          .filter(isRecord)
          .map((p) => ({ name: str(p.name, ""), time: str(p.time, "") }))
          .slice(0, MAX_PROGRAMME)
      : d.programme,
    couplePhoto: photo(raw.couplePhoto),
    couplePhotoFocus: typeof raw.couplePhotoFocus === "string" && raw.couplePhotoFocus in PHOTO_FOCUS ? (raw.couplePhotoFocus as PhotoFocus) : d.couplePhotoFocus,
    story: Array.from({ length: STORY_SLOTS }, (_, i) => {
      const p = story[i];
      const base = photo(p);
      return base && isRecord(p) ? { ...base, year: str(p.year, ""), caption: str(p.caption, "") } : null;
    }),
  };
}

export function toWedding(details: WeddingDetails): Wedding {
  const [a, b] = details.partners;
  const coupleNames = `${a} & ${b}`;
  const coupleAlt = `${a} and ${b}`;
  const couple = {
    src: details.couplePhoto?.src ?? wedding.images.couple.src,
    alt: coupleAlt,
    focus: PHOTO_FOCUS[details.couplePhotoFocus].position,
  };
  return {
    details,
    partners: [a, b],
    coupleNames,
    monogram: [a.charAt(0).toUpperCase(), b.charAt(0).toUpperCase()],
    date: details.date,
    city: details.city,
    rsvpDeadline: details.rsvpDeadline,
    rsvpClosesAt: endOfDayInAccra(details.rsvpDeadline),
    contact: details.contact,
    events: EVENTS.map((e) => {
      const ev = details.events[e.id];
      return { ...e, ...ev, mapUrl: ev.mapUrl || mapUrlFor(ev.venue) };
    }),
    programme: details.programme.filter((p) => p.name.trim()),
    story: details.story
      .filter((p): p is StoryPhoto => p !== null)
      .map((p) => ({ ...p, alt: p.caption ? `${coupleAlt}: ${p.caption}` : coupleAlt, focus: "50% 30%" })),
    images: { couple, roseBreak: wedding.images.roseBreak },
    cardVersion: shortHash(JSON.stringify([a, b, details.date, couple.src, couple.focus, wedding.previewWithPhoto])),
  };
}
