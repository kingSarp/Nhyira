import { cn } from "@/lib/cn";
import type { Invitation } from "@/lib/data/types";
import { shortDate } from "@/lib/format";
import { displayTime } from "@/lib/wedding";
import type { ProgrammeItem } from "@/lib/content/wedding";
import { EventCard } from "./EventCard";
import type { InvitedEvent } from "./EventList";

/** After replies close: each event with who is going, or "Not attending". */
export function ClosedCelebrations({ events, invitation, programme }: { events: InvitedEvent[]; invitation: Invitation; programme: ProgrammeItem[] }) {
  return (
    <section aria-labelledby="your-celebrations" className="flex flex-col px-7 pt-10">
      <h2 id="your-celebrations" className="type-eyebrow m-0 mb-5 text-center font-normal">
        Your celebrations
      </h2>
      <ul className="m-0 list-none p-0">
        {events.map((e, i) => {
          const r = invitation.responses?.[e.id];
          const declined = r && !r.attending;
          return (
            <li key={e.id} className={cn("border-t border-line", declined ? "py-6" : "py-10", i === events.length - 1 && "border-b")}>
              {declined ? (
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <h3 className="m-0 font-display text-[28px] font-normal leading-tight text-ink-2">{e.name}</h3>
                  <p className="type-meta m-0">
                    {shortDate(e.date)} · {displayTime(e.time)} · Not attending
                  </p>
                </div>
              ) : (
                <EventCard event={e} programme={programme}>
                  {r?.names.length ? <p className="m-0 text-[15px] text-success">{r.names.join(", ")}</p> : null}
                </EventCard>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
