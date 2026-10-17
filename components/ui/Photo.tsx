import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Full-bleed photo with an optional bottom scrim and overlay content.
 * The parent sets the height; the image covers it.
 */
export function Photo({
  src,
  alt,
  focus = "50% 50%",
  sizes = "100vw",
  priority,
  scrimHeight,
  className,
  children,
}: {
  src: string;
  alt: string;
  focus?: string;
  sizes?: string;
  priority?: boolean;
  /** Height of the bottom scrim, e.g. "40%". Omit for none. */
  scrimHeight?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-line", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: focus }} />
      {scrimHeight && <div aria-hidden className="scrim absolute inset-x-0 bottom-0" style={{ height: scrimHeight }} />}
      {children}
    </div>
  );
}

/** Year + caption laid over the bottom-left of a story photo. */
export function PhotoCaption({ year, caption, small }: { year: string; caption: string; small?: boolean }) {
  return (
    <figcaption className={cn("absolute flex flex-col gap-1 text-white", small ? "bottom-4 left-4" : "bottom-6 left-6")}>
      <span className={cn("font-display leading-none", small ? "text-[28px]" : "text-[34px]")}>{year}</span>
      <span className={cn("uppercase tracking-[0.2em]", small ? "text-[11px]" : "text-[13px]")}>{caption}</span>
    </figcaption>
  );
}
