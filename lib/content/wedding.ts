// What's fixed in code, and the starting values for what organisers edit.
//
// Names, dates, venues, times, dress colours, the contact, the RSVP deadline
// and the story photos are edited on /admin/details and stored in the
// database. Screens read them with getWedding() from "@/lib/data"; the
// defaults below are used until the first save (and if the database can't be
// read). Never read the editable values from `defaultDetails` in a screen.

export type DressColour = { name: string; hex: string };

export type EventId = "engagement" | "wedding" | "reception";

export type EventDef = {
  /** Matches the keys of a household's `seats`. */
  id: EventId;
  name: string;
  /** Short label for the dashboard, e.g. "Church". */
  shortName: string;
};

/** Fixed: seats, replies and sign-up links are keyed by these ids. */
export const EVENTS: readonly EventDef[] = [
  { id: "engagement", name: "The Engagement", shortName: "Engagement" },
  { id: "wedding", name: "The Wedding", shortName: "Church" },
  { id: "reception", name: "The Reception", shortName: "Reception" },
];

export type EventDetails = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Display time, e.g. "10:00 AM". Empty shows "Time TBC". */
  time: string;
  venue: string;
  /** Empty: a Google Maps search for the venue. */
  mapUrl: string;
  dressColours: DressColour[];
};

export type StoryPhoto = UploadedPhoto & {
  year: string;
  caption: string;
};

export const STORY_SLOTS = 4;

/** An uploaded photo in Supabase Storage. */
export type UploadedPhoto = {
  /** Public URL. */
  src: string;
  /** Object path in the bucket, so a replaced photo can be deleted. */
  path: string;
};

/** Which part of the main photo stays in view when it's cropped. */
export type PhotoFocus = "top" | "center" | "bottom";
export const PHOTO_FOCUS: Record<PhotoFocus, { label: string; position: string }> = {
  top: { label: "Top", position: "50% 15%" },
  center: { label: "Centre", position: "50% 40%" },
  bottom: { label: "Bottom", position: "50% 75%" },
};

/** Everything organisers edit on /admin/details. */
export type WeddingDetails = {
  partners: [string, string];
  /** The main wedding day, YYYY-MM-DD */
  date: string;
  city: string;
  /** YYYY-MM-DD. Replies close at the end of this day, Accra time. */
  rsvpDeadline: string;
  contact: { name: string; phone: string };
  events: Record<EventId, EventDetails>;
  /** The main photo: invite headers, home page, WhatsApp card. Null uses the built-in photo. */
  couplePhoto: UploadedPhoto | null;
  couplePhotoFocus: PhotoFocus;
  /** Four slots in display order; null is an empty slot. */
  story: (StoryPhoto | null)[];
};

const VENUE = "20 Asikuma Ave, GD-134-4557";

export const defaultDetails: WeddingDetails = {
  partners: ["Kay", "Ama"],
  date: "2026-12-26",
  city: "Accra, Ghana",
  rsvpDeadline: "2026-12-12",
  contact: { name: "Auntie Efua", phone: "" },
  events: {
    engagement: {
      date: "2026-12-26",
      time: "",
      venue: VENUE,
      mapUrl: "",
      dressColours: [
        { name: "Kente green", hex: "#1F5A3D" },
        { name: "Gold", hex: "#D4AF37" },
      ],
    },
    wedding: {
      date: "2026-12-26",
      time: "",
      venue: VENUE,
      mapUrl: "",
      dressColours: [
        { name: "Ivory", hex: "#FFFFF0" },
        { name: "Blush", hex: "#F4C2C2" },
      ],
    },
    reception: {
      date: "2026-12-26",
      time: "",
      venue: VENUE,
      mapUrl: "",
      dressColours: [
        { name: "Champagne", hex: "#F7E7CE" },
        { name: "Burgundy", hex: "#6E1423" },
      ],
    },
  },
  couplePhoto: null,
  couplePhotoFocus: "center",
  story: [null, null, null, null],
};

/** Not edited from the dashboard. */
export const wedding = {
  tagline: "Come witness the beginning of our forever.",
  /** Follows the guest's name on the invite. */
  inviteLine: "come witness the beginning of our forever.",
  /** WhatsApp preview card: the couple's photo on the left (true) or the plain cream card (false). */
  previewWithPhoto: true,
  events: EVENTS,
  // The couple's photo is the main image, the WhatsApp preview and the
  // thank-you and welcome-back headers. The closing panel uses the rose photo.
  images: {
    /** Built-in main photo, until one is uploaded on /admin/details. */
    couple: { src: "/images/kay-ama.jpg" },
    roses: { src: "/images/roses.png", alt: "" },
    roseBreak: { src: "/images/rose-break.jpg", alt: "", focus: "50% 45%" },
  },
};
