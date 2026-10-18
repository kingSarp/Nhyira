// Everything specific to this wedding. Screens read from here; nothing else
// should hard-code names, dates or venues. Unknowns stay as [PLACEHOLDER].

export type DressColour = { name: string; hex: string };

export type WeddingEvent = {
  /** Matches the keys of a household's `seats`. */
  id: "engagement" | "wedding" | "reception";
  name: string;
  /** Short label for the dashboard, e.g. "Church". */
  shortName: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Display time, e.g. "10:00 AM" */
  time: string;
  venue: string;
  mapUrl: string;
  dressColours: DressColour[];
};

export type StoryPhoto = {
  src: string;
  alt: string;
  year: string;
  caption: string;
  /** CSS object-position, so faces stay in frame when cropped. */
  focus: string;
};

const VENUE = "20 Asikuma Ave, GD-134-4557";
const MAP_URL = "https://maps.google.com/?q=20+Asikuma+Ave+GD-134-4557+Accra";
const COUPLE_PHOTO = "/images/kay-ama.jpg";

export const wedding = {
  coupleNames: "Kay & Ama",
  partners: ["Kay", "Ama"] as const,
  monogram: ["K", "A"] as const,
  tagline: "Come witness the beginning of our forever.",
  /** Follows the guest's name on the invite. */
  inviteLine: "come witness the beginning of our forever.",
  city: "Accra, Ghana",
  /** The main wedding day, shown as 26 · 12 · 2026 */
  date: "2026-12-26",
  /** After this moment guests can no longer change their reply. Two weeks before; confirm with the couple. */
  rsvpDeadline: "2026-12-12T23:59:59Z",
  contact: { name: "Auntie Efua", phone: "[PHONE NUMBER]" },
  /** WhatsApp preview card: the couple's photo on the left (true) or the plain cream card (false). */
  previewWithPhoto: true,

  // All three events are on the wedding day at the couple's address. Times
  // and dress colours are still to be confirmed with the couple.
  events: [
    {
      id: "engagement",
      name: "The Engagement",
      shortName: "Engagement",
      date: "2026-12-26",
      time: "Time TBC",
      venue: VENUE,
      mapUrl: MAP_URL,
      dressColours: [
        { name: "Kente green", hex: "#1F5A3D" },
        { name: "Gold", hex: "#D4AF37" },
      ],
    },
    {
      id: "wedding",
      name: "The Wedding",
      shortName: "Church",
      date: "2026-12-26",
      time: "Time TBC",
      venue: VENUE,
      mapUrl: MAP_URL,
      dressColours: [
        { name: "Ivory", hex: "#FFFFF0" },
        { name: "Blush", hex: "#F4C2C2" },
      ],
    },
    {
      id: "reception",
      name: "The Reception",
      shortName: "Reception",
      date: "2026-12-26",
      time: "Time TBC",
      venue: VENUE,
      mapUrl: MAP_URL,
      dressColours: [
        { name: "Champagne", hex: "#F7E7CE" },
        { name: "Burgundy", hex: "#6E1423" },
      ],
    },
  ] satisfies WeddingEvent[],

  // The couple's photo is the main image, the WhatsApp preview and the thank-you
  // and welcome-back headers. The closing panel uses the rose photo.
  images: {
    hero: { src: COUPLE_PHOTO, alt: "Kay and Ama at a window, looking out", focus: "50% 35%" },
    roses: { src: "/images/roses.png", alt: "" },
    roseBreak: { src: "/images/rose-break.jpg", alt: "", focus: "50% 45%" },
    closing: { src: "/images/rose-break.jpg", alt: "", focus: "50% 45%" },
    thanks: { src: COUPLE_PHOTO, alt: "Kay and Ama at a window, looking out", focus: "50% 35%" },
    returning: { src: COUPLE_PHOTO, alt: "Kay and Ama at a window, looking out", focus: "50% 35%" },
  },

  /** "Our story" photos on the invite. Empty hides the section; add the couple's photos here when they send them. */
  story: [] as StoryPhoto[],
};

export type EventId = WeddingEvent["id"];
