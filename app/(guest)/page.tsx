import { ClosingPhoto } from "@/components/guest/ClosingPhoto";
import { DayExtras, MapLink } from "@/components/guest/EventCard";
import { Roses } from "@/components/guest/Roses";
import { fullHeight } from "@/components/guest/sizes";
import { Story } from "@/components/guest/Story";
import { CoupleNames, Photo } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { dotDate, fullDate } from "@/lib/format";

/** Whole days from today (Accra) to the wedding date; 0 on the day, negative after. */
function daysUntil(isoDate: string) {
  const today = new Date().toISOString().slice(0, 10); // Accra is UTC all year
  return Math.round((Date.parse(isoDate) - Date.parse(today)) / 86_400_000);
}

/** 3 · Home / save the date. For anyone who opens the bare address. */
export default async function HomePage() {
  const w = await getWedding();
  const img = w.images.couple;
  const day = w.events[0];
  const days = daysUntil(w.date);

  return (
    <main className="mx-auto w-full max-w-[520px] overflow-x-clip bg-paper">
      <header className="motion-settle">
        <Photo src={img.src} alt={img.alt} focus={img.focus} sizes={fullHeight} priority scrimHeight="60%" className="h-dvh min-h-[600px]">
          <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-3 px-8 text-center text-white">
            <p className="motion-rise m-0 text-[12px] uppercase tracking-[0.32em] [--rise-delay:300ms]">Save the date</p>
            <CoupleNames partners={w.partners} as="h1" size="hero" stacked className="motion-rise [--rise-delay:550ms]" />
            <p className="type-dateline motion-rise m-0 mt-1 [--rise-delay:850ms]">{dotDate(w.date)}</p>
            <p className="motion-rise m-0 max-w-[30ch] text-[14px] [--rise-delay:1000ms]">{day.venue}</p>
          </div>
        </Photo>
      </header>

      <section aria-label="Countdown" className="motion-reveal flex flex-col items-center gap-2.5 px-8 pt-12 pb-14 text-center">
        <Roses />
        <p className="m-0 text-ink-2">{wedding.tagline}</p>
        {days > 0 && (
          <p className="m-0 mt-6 flex flex-col items-center gap-3">
            <span className="font-display text-[72px] font-light leading-none [font-variant-numeric:lining-nums]">{days}</span>
            <span className="type-eyebrow">{days === 1 ? "Day to go" : "Days to go"}</span>
          </p>
        )}
        {days === 0 && <p className="type-title m-0 mt-6">Today’s the day</p>}
      </section>

      <Story />

      <section aria-labelledby="the-day" className="motion-reveal flex flex-col items-center gap-7 border-t border-line px-7 pt-14 pb-14 text-center">
        <div className="flex flex-col items-center gap-3">
          <h2 id="the-day" className="type-eyebrow m-0 font-normal">
            The day
          </h2>
          <p className="m-0 font-display text-[34px] font-light italic leading-tight">{fullDate(w.date)}</p>
          <p className="m-0 max-w-[28ch] text-[17px]">{day.venue}</p>
          <MapLink event={day} className="inline-flex min-h-11 items-center text-[15px] underline">
            Open in Google Maps
          </MapLink>
        </div>
        <DayExtras event={day} programme={w.programme} />
      </section>

      <section aria-label="Invited?" className="motion-reveal flex flex-col items-center gap-2 bg-panel px-8 py-12 text-center">
        <p className="type-title m-0 text-[34px]">Invited?</p>
        <p className="m-0 max-w-[30ch] text-ink-2">Open your personal link from WhatsApp to reply and get your pass.</p>
      </section>

      <ClosingPhoto />
    </main>
  );
}
