import type { ReactNode } from "react";
import { CoupleNames, Photo } from "@/components/ui";
import { cn } from "@/lib/cn";
import { wedding } from "@/lib/content/wedding";
import { dotDate } from "@/lib/format";
import { fullColumn } from "./sizes";

type Img = { src: string; alt: string; focus?: string };

/**
 * Full-bleed photo with the couple's names over a bottom scrim.
 * `eyebrow` sits above the names, `children` below the date.
 */
export function HeroPhoto({
  image = wedding.images.hero,
  eyebrow,
  height = "tall",
  stacked = true,
  names = "hero",
  live,
  children,
}: {
  image?: Img;
  eyebrow?: ReactNode;
  height?: "tall" | "medium" | "short";
  stacked?: boolean;
  names?: "hero" | "lg" | "md";
  /** Announce the text to screen readers (used after submitting). */
  live?: boolean;
  children?: ReactNode;
}) {
  const h = {
    tall: "h-[min(780px,92svh)] min-h-[560px]",
    medium: "h-[min(620px,80svh)] min-h-[480px]",
    short: "h-[min(540px,70svh)] min-h-[420px]",
  }[height];

  return (
    <header>
      <Photo src={image.src} alt={image.alt} focus={image.focus} sizes={fullColumn} priority scrimHeight="55%" className={h}>
        <div
          role={live ? "status" : undefined}
          className={cn(
            "absolute inset-x-0 flex flex-col items-center gap-2.5 px-6 text-center text-white",
            height === "tall" ? "bottom-12" : "bottom-9",
          )}
        >
          {eyebrow && <p className="m-0 text-[12px] uppercase tracking-[0.32em]">{eyebrow}</p>}
          <CoupleNames as="h1" size={names} stacked={stacked} />
          <p className="type-dateline m-0 mt-1.5">{dotDate(wedding.date)}</p>
          {children}
        </div>
      </Photo>
    </header>
  );
}
