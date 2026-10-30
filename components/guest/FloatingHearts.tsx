import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const HEART = "M12 20.6C6.1 16.2 2.6 12.8 2.6 8.7c0-2.8 2.2-5 4.9-5 1.8 0 3.4.9 4.5 2.4 1.1-1.5 2.7-2.4 4.5-2.4 2.7 0 4.9 2.2 4.9 5 0 4.1-3.5 7.5-9.4 11.9z";
const SPARKLE = "M12 2.5l1.9 7.6 7.6 1.9-7.6 1.9L12 21.5l-1.9-7.6L2.5 12l7.6-1.9z";

type Shape = "heart" | "outline" | "sparkle";

// Left position, delay, duration, size, sideways drift, shape and colour for each one.
const ITEMS: { left: string; delay: string; duration: string; size: number; x: string; shape: Shape; gold: boolean }[] = [
  { left: "6%", delay: "0s", duration: "11s", size: 16, x: "18px", shape: "heart", gold: true },
  { left: "18%", delay: "4s", duration: "9s", size: 10, x: "-10px", shape: "sparkle", gold: true },
  { left: "29%", delay: "2s", duration: "10.5s", size: 13, x: "-12px", shape: "outline", gold: false },
  { left: "41%", delay: "6.5s", duration: "12s", size: 18, x: "14px", shape: "heart", gold: true },
  { left: "54%", delay: "1.2s", duration: "10s", size: 11, x: "-16px", shape: "heart", gold: false },
  { left: "65%", delay: "5.2s", duration: "9.5s", size: 9, x: "10px", shape: "sparkle", gold: true },
  { left: "75%", delay: "3s", duration: "11.5s", size: 15, x: "12px", shape: "outline", gold: true },
  { left: "86%", delay: "7.5s", duration: "10s", size: 12, x: "-14px", shape: "heart", gold: false },
  { left: "94%", delay: "2.6s", duration: "12.5s", size: 10, x: "-8px", shape: "sparkle", gold: true },
];

/**
 * Hearts and small sparkles drifting up behind content. Decorative; nothing
 * shows under reduced motion. Gold and white over photos; `onPaper` makes
 * them all gold.
 */
export function FloatingHearts({ onPaper, className }: { onPaper?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {ITEMS.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={h.size}
          height={h.size}
          className={cn("motion-float absolute bottom-0", h.gold || onPaper ? "text-gold" : "text-white")}
          style={{ left: h.left, "--float-delay": h.delay, "--float-duration": h.duration, "--float-x": h.x } as CSSProperties}
        >
          {h.shape === "outline" ? (
            <path d={HEART} fill="none" stroke="currentColor" strokeWidth="1.8" />
          ) : (
            <path d={h.shape === "sparkle" ? SPARKLE : HEART} fill="currentColor" />
          )}
        </svg>
      ))}
    </div>
  );
}
