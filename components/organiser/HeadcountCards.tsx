import type { Headcount } from "@/lib/data/types";

/** One figure per event: confirmed seats of invited seats. */
export function HeadcountCards({ headcount }: { headcount: Headcount[] }) {
  return (
    <section aria-label="Headcount" className="grid gap-3 lg:grid-cols-3 lg:gap-8">
      {headcount.map((h) => (
        <div
          key={h.eventId}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5 border-t-2 border-ink pt-3.5 pb-1 lg:flex lg:flex-col lg:gap-2 lg:py-5"
        >
          <h2 className="type-label m-0 text-[13px] font-normal tracking-[0.12em] text-ink-2 lg:text-[14px]">{h.eventName.replace(/^The /, "")}</h2>
          <p className="m-0 row-span-2 self-center text-[32px] leading-none lg:self-start lg:text-[44px]">
            {h.confirmed}
            <span className="text-[16px] text-ink-2 lg:text-[20px]">
              <span className="lg:hidden"> / {h.invited}</span>
              <span className="hidden lg:inline"> of {h.invited} seats</span>
            </span>
            <span className="sr-only"> seats confirmed</span>
          </p>
          <p className="m-0 text-[14px] text-ink-2 lg:text-[15px]">
            <span className="lg:hidden">confirmed · </span>
            {h.waiting} waiting · {h.declined} declined
          </p>
        </div>
      ))}
    </section>
  );
}
