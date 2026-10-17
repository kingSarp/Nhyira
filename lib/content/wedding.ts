// Everything specific to this wedding. Screens read from here; nothing else
// should hard-code names, dates or venues. Unknowns stay as [PLACEHOLDER].

export type DressColour = { name: string; hex: string };

export type WeddingEvent = {
  /** Matches the keys of a household's `seats`. */
  id: "engagement" | "wedding" | "reception";
  name: string;
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

export const wedding = {
  coupleNames: "Yaw & Lady",
  partners: ["Yaw", "Lady"] as const,
  monogram: ["Y", "L"] as const,
  tagline: "Come witness the beginning of our forever.",
  city: "Accra, Ghana",
  /** The main wedding day, shown as 13 · 02 · 2027 */
  date: "2027-02-13",
  /** After this moment guests can no longer change their reply. */
  rsvpDeadline: "2027-01-31T23:59:59Z",
  contact: { name: "Auntie Efua", phone: "[PHONE NUMBER]" },

  events: [
    {
      id: "engagement",
      name: "The Engagement",
      date: "2027-02-12",
      time: "10:00 AM",
      venue: "Family House, East Legon",
      mapUrl: "https://maps.google.com/?q=East+Legon+Accra",
      dressColours: [
        { name: "Kente green", hex: "#1F5A3D" },
        { name: "Gold", hex: "#D4AF37" },
      ],
    },
    {
      id: "wedding",
      name: "The Wedding",
      date: "2027-02-13",
      time: "9:00 AM",
      venue: "Christ the King Church",
      mapUrl: "https://maps.google.com/?q=Christ+the+King+Church+Accra",
      dressColours: [
        { name: "Ivory", hex: "#FFFFF0" },
        { name: "Blush", hex: "#F4C2C2" },
      ],
    },
    {
      id: "reception",
      name: "The Reception",
      date: "2027-02-13",
      time: "2:00 PM",
      venue: "Movenpick Ambassador Hotel",
      mapUrl: "https://maps.google.com/?q=Movenpick+Ambassador+Hotel+Accra",
      dressColours: [
        { name: "Champagne", hex: "#F7E7CE" },
        { name: "Burgundy", hex: "#6E1423" },
      ],
    },
  ] satisfies WeddingEvent[],

  images: {
    hero: { src: "/images/hero-portrait.jpg", alt: "Yaw and Lady, portrait", focus: "45% 20%" },
    roses: { src: "/images/roses.png", alt: "" },
    roseBreak: { src: "/images/rose-break.jpg", alt: "", focus: "50% 45%" },
    closing: { src: "/images/closing-heart.jpg", alt: "Yaw and Lady making a heart with their hands", focus: "50% 20%" },
    thanks: { src: "/images/thanks.jpg", alt: "Lady laughing with Yaw", focus: "50% 25%" },
    returning: { src: "/images/returning.jpg", alt: "Yaw and Lady standing together", focus: "50% 15%" },
  },

  story: [
    { src: "/images/story-2019.jpg", alt: "The couple sitting together in warm light", year: "2019", caption: "Where it began", focus: "40% 50%" },
    { src: "/images/story-2023-ring.jpg", alt: "Hands passing an engagement ring", year: "2023", caption: "She said yes", focus: "52% 50%" },
    { src: "/images/story-2025-kente.jpg", alt: "The couple in kente", year: "2025", caption: "Two families", focus: "50% 30%" },
    { src: "/images/story-2027.jpg", alt: "Yaw lifting Lady, both laughing", year: "2027", caption: "Forever begins", focus: "50% 30%" },
  ] satisfies StoryPhoto[],
};

export type EventId = WeddingEvent["id"];
