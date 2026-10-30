import { cn } from "@/lib/cn";
import type { ProgrammeItem } from "@/lib/content/wedding";
import type { WeddingEvent } from "@/lib/wedding";
import { EventCard } from "./EventCard";

export { MapLink } from "./EventCard";

export type InvitedEvent = WeddingEvent & { seats: number };

/**
 * "The celebrations": the event (or events) the household is invited to, with
 * the day's programme. `seats` shows "Admits N"; the sign-up page leaves it out.
 */
export function EventList({ events, programme }: { events: (WeddingEvent & { seats?: number })[]; programme: ProgrammeItem[] }) {
  return (
    <section aria-labelledby="celebrations" className="flex flex-col px-7 pt-14 pb-2">
      <h2 id="celebrations" className="type-eyebrow motion-reveal m-0 mb-5 text-center font-normal">
        The celebrations
      </h2>
      <ul className="m-0 list-none p-0">
        {events.map((e, i) => (
          <li key={e.id} className={cn("border-t border-line py-10", i === events.length - 1 && "border-b")}>
            <EventCard event={e} programme={programme} seats={e.seats} />
          </li>
        ))}
      </ul>
    </section>
  );
}
