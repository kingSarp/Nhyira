import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DressColour, WeddingEvent } from "@/lib/content/wedding";
import { shortDate } from "@/lib/format";

export type InvitedEvent = WeddingEvent & { seats: number };

export function MapLink({ event }: { event: WeddingEvent }) {
  return (
    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`Map for ${event.name}, opens Google Maps`}>
      Map
    </a>
  );
}

export function DressColours({ colours }: { colours: DressColour[] }) {
  return (
    <ul aria-label="Dress colours" className="m-0 flex list-none flex-wrap gap-3.5 p-0">
      {colours.map((c) => (
        <li key={c.name} className="flex items-center gap-1.5 text-[14px] text-ink-2">
          <span
            aria-hidden
            className="inline-block size-4 flex-none rounded-full border border-border"
            style={{ backgroundColor: c.hex }}
          />
          {c.name}
        </li>
      ))}
    </ul>
  );
}

/** "The celebrations": one entry per event the household is invited to. */
export function EventList({ events }: { events: InvitedEvent[] }) {
  return (
    <section aria-labelledby="celebrations" className="flex flex-col px-7 pt-14 pb-2">
      <h2 id="celebrations" className="type-eyebrow m-0 mb-5 text-center font-normal">
        The celebrations
      </h2>
      <ul className="m-0 list-none p-0">
        {events.map((e, i) => (
          <li
            key={e.id}
            className={cn("flex flex-col gap-1.5 border-t border-line py-6", i === events.length - 1 && "border-b")}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="type-event m-0">{e.name}</h3>
              <Badge tone="seats">Admits {e.seats}</Badge>
            </div>
            <p className="type-meta m-0">
              {shortDate(e.date)} · {e.time}
              <br />
              {e.venue} · <MapLink event={e} />
            </p>
            <DressColours colours={e.dressColours} />
          </li>
        ))}
      </ul>
    </section>
  );
}
