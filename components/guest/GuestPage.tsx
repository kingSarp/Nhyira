import type { ReactNode } from "react";
import { Music } from "./Music";

/**
 * The guest column. Phones get the full width; larger screens get a centred
 * invitation-width column so photos and line lengths stay as designed.
 * `sealed`: an EnvelopeIntro covers the page and its load animations wait for
 * it. Without JavaScript the envelope is hidden and the animations run.
 * Includes the music button when a song is set.
 */
export function GuestPage({ sealed, children }: { sealed?: boolean; children: ReactNode }) {
  return (
    <main data-sealed={sealed || undefined} tabIndex={-1} className="mx-auto w-full max-w-[520px] overflow-x-clip bg-paper outline-none">
      {sealed && (
        <noscript>
          <style>{".envelope-intro{display:none!important}[data-sealed] *{animation-play-state:running!important}"}</style>
        </noscript>
      )}
      {children}
      <Music />
    </main>
  );
}
