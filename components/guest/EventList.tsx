import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DressColour, ProgrammeItem } from "@/lib/content/wedding";
import { shortDate } from "@/lib/format";
import { displayTime, type WeddingEvent } from "@/lib/wedding";

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

/** The parts of the day, e.g. "Engagement · 10:00 AM". Wording only. */
export function Programme({ items }: { items: ProgrammeItem[] }) {
  if (!items.length) return null;
  return (
    <ol aria-label="Programme" className="m-0 mt-1 flex list-none flex-col gap-1 border-l border-line p-0 pl-4">
      {items.map((p, i) => (
        <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 text-[15px]">
          <span>{p.name}</span>
          {p.time && <span className="text-ink-2">{p.time}</span>}
        </li>
      ))}
    </ol>
  );
}

/** "The celebrations": the event (or events) the household is invited to, with the day's programme. */
export function EventList({ events, programme }: { events: InvitedEvent[]; programme: ProgrammeItem[] }) {
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
              {shortDate(e.date)} · {displayTime(e.time)}
              <br />
              {e.venue} · <MapLink event={e} />
            </p>
            <Programme items={programme} />
            <DressColours colours={e.dressColours} />
          </li>
        ))}
      </ul>
    </section>
  );
}
