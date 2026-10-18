import { cn } from "@/lib/cn";
import type { Invitation } from "@/lib/data/types";
import { shortDate } from "@/lib/format";
import { displayTime } from "@/lib/wedding";
import { DressColours, MapLink, type InvitedEvent } from "./EventList";

/** After replies close: each event with who is going, or "Not attending". */
export function ClosedCelebrations({ events, invitation }: { events: InvitedEvent[]; invitation: Invitation }) {
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
            <li key={e.id} className={cn("flex flex-col gap-1.5 border-t border-line py-6", i === events.length - 1 && "border-b")}>
              <h3 className={cn("m-0 font-display text-[28px] font-normal leading-tight", declined && "text-ink-2")}>{e.name}</h3>
              {declined ? (
                <p className="type-meta m-0">
                  {shortDate(e.date)} · {displayTime(e.time)} · Not attending
                </p>
              ) : (
                <>
                  <p className="type-meta m-0">
                    {shortDate(e.date)} · {displayTime(e.time)}
                    <br />
                    {e.venue} · <MapLink event={e} />
                  </p>
                  {r?.names.length ? <p className="m-0 text-[15px] text-success">{r.names.join(", ")}</p> : null}
                  <DressColours colours={e.dressColours} />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
