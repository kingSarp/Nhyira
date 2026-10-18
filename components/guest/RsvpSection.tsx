import type { ReactNode } from "react";
import { getWedding } from "@/lib/data";
import { dayMonth } from "@/lib/format";

/** The sand-coloured RSVP panel. `heading` is omitted on the returning view. */
export async function RsvpSection({ heading = true, children }: { heading?: boolean; children: ReactNode }) {
  const { rsvpDeadline } = await getWedding();
  return (
    <section aria-labelledby={heading ? "rsvp-title" : undefined} aria-label={heading ? undefined : "Your reply"} className="mt-14 flex flex-col gap-[26px] bg-panel px-7 py-14">
      {heading && (
        <div className="flex flex-col gap-1.5 text-center">
          <h2 id="rsvp-title" className="type-title m-0">
            Will you join us?
          </h2>
          <p className="type-meta m-0">Kindly reply by {dayMonth(rsvpDeadline)}</p>
        </div>
      )}
      {children}
    </section>
  );
}
