import { fullColumn } from "@/components/guest/sizes";
import { CoupleNames, Photo } from "@/components/ui";
import { getWedding } from "@/lib/data";
import { dotDate } from "@/lib/format";

/** 3 · Home / save the date. For anyone who opens the bare address. */
export default async function HomePage() {
  const w = await getWedding();
  const img = w.images.couple;
  return (
    <main className="mx-auto w-full max-w-[520px]">
      <Photo src={img.src} alt={img.alt} focus={img.focus} sizes={fullColumn} priority scrimHeight="60%" className="h-dvh min-h-[600px]">
        <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-3 px-8 text-center text-white">
          <p className="m-0 text-[12px] uppercase tracking-[0.32em]">Save the date</p>
          <CoupleNames partners={w.partners} as="h1" size="hero" stacked />
          <p className="type-dateline m-0 mt-1">{dotDate(w.date)}</p>
          <p className="m-0 text-[14px]">{w.city}</p>
          <p className="m-0 mt-[18px] text-[14px] leading-relaxed">Invited? Open your personal link from WhatsApp.</p>
        </div>
      </Photo>
    </main>
  );
}
