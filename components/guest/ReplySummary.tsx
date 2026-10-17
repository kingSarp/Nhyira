import { cn } from "@/lib/cn";
import type { Invitation } from "@/lib/data/types";
import type { InvitedEvent } from "./EventList";

/** One row per event: who is coming, or "Can't make it". */
export function ReplySummary({ events, invitation }: { events: InvitedEvent[]; invitation: Invitation }) {
  return (
    <dl className="m-0">
      {events.map((e, i) => {
        const r = invitation.responses?.[e.id];
        const attending = !!r?.attending && r.names.length > 0;
        return (
          <div
            key={e.id}
            className={cn("flex items-baseline justify-between gap-3 border-t border-line py-[18px]", i === events.length - 1 && "border-b")}
          >
            <dt className="font-display text-[24px] font-medium leading-tight">{e.name}</dt>
            <dd className={cn("m-0 text-right text-[14px]", attending ? "text-success" : "text-ink-2")}>
              {attending ? r!.names.join(", ") : "Can't make it"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
