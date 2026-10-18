import { getWedding } from "@/lib/data";
import { longDate } from "@/lib/format";
import { displayTime } from "@/lib/wedding";
import { DressColours, MapLink, Programme } from "./EventList";

/** When and where, the programme and what to wear: one block for the sign-up page and the pass. */
export async function DayDetails({ className }: { className?: string }) {
  const { events, programme } = await getWedding();
  const day = events[0];
  return (
    <div className={className}>
      <dl className="m-0 flex flex-col gap-3 text-[16px]">
        <div>
          <dt className="type-eyebrow">When</dt>
          <dd className="m-0 mt-1">
            {longDate(day.date)} · {displayTime(day.time)}
          </dd>
        </div>
        <div>
          <dt className="type-eyebrow">Where</dt>
          <dd className="m-0 mt-1">
            {day.venue} · <MapLink event={day} />
          </dd>
        </div>
        {programme.length > 0 && (
          <div>
            <dt className="type-eyebrow">Programme</dt>
            <dd className="m-0 mt-1.5">
              <Programme items={programme} />
            </dd>
          </div>
        )}
        {day.dressColours.length > 0 && (
          <div>
            <dt className="type-eyebrow">Dress colours</dt>
            <dd className="m-0 mt-1.5">
              <DressColours colours={day.dressColours} />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
