import {
  EVENTS,
  STORY_SLOTS,
  defaultDetails,
  wedding,
  type EventDef,
  type EventDetails,
  type StoryPhoto,
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
  /** Filled slots only, in order. The story section shows when all four are filled. */
  story: (StoryPhoto & { alt: string; focus: string })[];
  images: { couple: Img; roseBreak: Img };
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
    story: Array.from({ length: STORY_SLOTS }, (_, i) => {
      const p = story[i];
      return isRecord(p) && typeof p.src === "string" && typeof p.path === "string"
        ? { src: p.src, path: p.path, year: str(p.year, ""), caption: str(p.caption, "") }
        : null;
    }),
  };
}

export function toWedding(details: WeddingDetails): Wedding {
  const [a, b] = details.partners;
  const coupleNames = `${a} & ${b}`;
  const coupleAlt = `${a} and ${b}`;
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
    story: details.story
      .filter((p): p is StoryPhoto => p !== null)
      .map((p) => ({ ...p, alt: p.caption ? `${coupleAlt}: ${p.caption}` : coupleAlt, focus: "50% 30%" })),
    images: {
      couple: { ...wedding.images.couple, alt: coupleAlt },
      roseBreak: wedding.images.roseBreak,
    },
  };
}
