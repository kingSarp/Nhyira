import type { ReactNode } from "react";
import { CoupleNames, Photo } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getWedding } from "@/lib/data";
import { dotDate } from "@/lib/format";
import type { Img } from "@/lib/wedding";
import { fullColumn, fullHeight } from "./sizes";

/**
 * Full-bleed photo with the couple's names over a bottom scrim.
 * `eyebrow` sits above the names, `byline` right after them ("invite you"),
 * `children` below the date.
 */
export async function HeroPhoto({
  image,
  eyebrow,
  byline,
  height = "tall",
  stacked = true,
  names = "hero",
  live,
  children,
}: {
  image?: Img;
  eyebrow?: ReactNode;
  byline?: ReactNode;
  height?: "tall" | "medium" | "short";
  stacked?: boolean;
  names?: "hero" | "lg" | "md";
  /** Announce the text to screen readers (used after submitting). */
  live?: boolean;
  children?: ReactNode;
}) {
  const w = await getWedding();
  const img = image ?? w.images.couple;
  const h = {
    tall: "h-[min(780px,92svh)] min-h-[560px]",
    medium: "h-[min(620px,80svh)] min-h-[480px]",
    short: "h-[min(540px,70svh)] min-h-[420px]",
  }[height];

  return (
    <header className="motion-settle">
      <Photo src={img.src} alt={img.alt} focus={img.focus} sizes={height === "tall" ? fullHeight : fullColumn} priority scrimHeight="55%" className={h}>
        <div
          role={live ? "status" : undefined}
          className={cn(
            "absolute inset-x-0 flex flex-col items-center gap-2.5 px-6 text-center text-white",
            height === "tall" ? "bottom-12" : "bottom-9",
          )}
        >
          {eyebrow && <p className="motion-rise m-0 text-[12px] uppercase tracking-[0.32em] [--rise-delay:300ms]">{eyebrow}</p>}
          <CoupleNames partners={w.partners} as="h1" size={names} stacked={stacked} className="motion-rise [--rise-delay:550ms]" />
          {byline && <p className="motion-rise m-0 font-display text-[26px] italic leading-tight [--rise-delay:750ms]">{byline}</p>}
          <p className="type-dateline motion-rise m-0 mt-1.5 [--rise-delay:950ms]">{dotDate(w.date)}</p>
          {children && <div className="motion-rise [--rise-delay:1150ms]">{children}</div>}
        </div>
      </Photo>
    </header>
  );
}
