import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { swatchImage, type ProgrammeItem } from "@/lib/content/wedding";
import { fullDate } from "@/lib/format";
import { displayTime, type WeddingEvent } from "@/lib/wedding";

export function MapLink({ event, className, children = "Map" }: { event: WeddingEvent; className?: string; children?: ReactNode }) {
  return (
    <a
      href={event.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Map for ${event.name}, opens Google Maps`}
      className={className}
    >
      {children}
    </a>
  );
}

/** A centred, eyebrow-labelled row of a `<dl>`. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <dt className="type-eyebrow">{label}</dt>
      <dd className="m-0 flex flex-col items-center">{children}</dd>
    </div>
  );
}

/**
 * One event on the invitation, laid out like a printed card: when and where,
 * then the programme, dress code and the note to guests. `children` sits under
 * the name (e.g. who is going, after replies close).
 */
export function EventCard({
  event,
  programme,
  seats,
  children,
}: {
  event: WeddingEvent;
  programme: ProgrammeItem[];
  seats?: number;
  children?: ReactNode;
}) {
  return (
    <article className="flex flex-col items-center gap-7 text-center">
      <header className="flex flex-col items-center gap-3">
        <h3 className="m-0 font-display text-[34px] font-light italic leading-none">{event.name}</h3>
        {seats !== undefined && <Badge tone="seats">Admits {seats}</Badge>}
        {children}
      </header>

      <dl className="m-0 flex flex-col items-center gap-5">
        <Row label="When">
          <span className="text-[17px]">{fullDate(event.date)}</span>
          <span className="type-meta">{displayTime(event.time)}</span>
        </Row>
        <Row label="Where">
          <span className="max-w-[28ch] text-[17px]">{event.venue}</span>
          <MapLink event={event} className="inline-flex min-h-11 items-center text-[15px] underline">
            Open in Google Maps
          </MapLink>
        </Row>
      </dl>

      <DayExtras event={event} programme={programme} />
    </article>
  );
}

/** Programme, dress code and the note to guests, centred. Empty parts are left out. */
export function DayExtras({ event, programme }: { event: WeddingEvent; programme: ProgrammeItem[] }) {
  const note = event.note.trim();
  const hasExtras = programme.length > 0 || event.dressColours.length > 0;
  return (
    <>
      {hasExtras && (
        <>
          <span aria-hidden className="block h-px w-12 bg-line" />
          <dl className="m-0 flex flex-col items-center gap-6">
            {programme.length > 0 && (
              <Row label="Programme">
                <ol className="m-0 flex list-none flex-col items-center gap-1 p-0">
                  {programme.map((p, i) => (
                    <li key={i}>
                      <span className="font-display text-[22px] italic">{p.name}</span>
                      {p.time && <span className="type-meta"> · {p.time}</span>}
                    </li>
                  ))}
                </ol>
              </Row>
            )}
            {event.dressColours.length > 0 && (
              <Row label="Dress code">
                <ul className="m-0 mt-1.5 flex list-none flex-wrap justify-center gap-x-7 gap-y-3 p-0">
                  {event.dressColours.map((c) => (
                    <li key={c.name} className="flex flex-col items-center gap-2 text-[15px]">
                      <span
                        aria-hidden
                        className="block size-8 rounded-full border border-border"
                        style={{
                          backgroundColor: c.hex,
                          backgroundImage: swatchImage(c.name) ? `url(${swatchImage(c.name)})` : undefined,
                          backgroundSize: "cover",
                        }}
                      />
                      {c.name}
                    </li>
                  ))}
                </ul>
              </Row>
            )}
          </dl>
        </>
      )}

      {note && (
        <div className="flex w-full flex-col items-center gap-1.5 bg-panel px-5 py-4">
          <p className="type-eyebrow m-0">Please note</p>
          <p className="m-0 text-[17px]">{note}</p>
        </div>
      )}
    </>
  );
}
