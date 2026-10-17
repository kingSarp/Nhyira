import localFont from "next/font/local";

// Self-hosted (SIL Open Font License, files from Fontsource). No request to
// Google at build or run time, and guests on mobile data get only Latin glyphs.

export const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "../app/fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../app/fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

export const greatVibes = localFont({
  variable: "--font-great-vibes",
  display: "swap",
  src: [{ path: "../app/fonts/great-vibes-latin-400-normal.woff2", weight: "400", style: "normal" }],
});

export const sourceSerif = localFont({
  variable: "--font-source-serif",
  display: "swap",
  src: [
    { path: "../app/fonts/source-serif-4-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/source-serif-4-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../app/fonts/source-serif-4-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const fontVariables = `${cormorant.variable} ${greatVibes.variable} ${sourceSerif.variable}`;
