import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

// Left position, delay, duration, size, sideways drift and colour for each heart.
const HEARTS = [
  { left: "8%", delay: "0s", duration: "11s", size: 14, x: "18px", gold: true },
  { left: "22%", delay: "3.5s", duration: "9s", size: 10, x: "-12px", gold: false },
  { left: "36%", delay: "6s", duration: "12s", size: 16, x: "14px", gold: true },
  { left: "52%", delay: "1.5s", duration: "10s", size: 11, x: "-16px", gold: false },
  { left: "66%", delay: "5s", duration: "11.5s", size: 15, x: "12px", gold: true },
  { left: "78%", delay: "8s", duration: "9.5s", size: 10, x: "-10px", gold: false },
  { left: "90%", delay: "2.5s", duration: "12.5s", size: 13, x: "-14px", gold: true },
];

/**
 * A few hearts drifting up behind content. Decorative; nothing shows under
 * reduced motion. Gold and white over photos; `onPaper` makes them all gold.
 */
export function FloatingHearts({ onPaper, className }: { onPaper?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {HEARTS.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={h.size}
          height={h.size}
          className={cn("motion-float absolute bottom-0", h.gold || onPaper ? "text-gold" : "text-white")}
          style={
            {
              left: h.left,
              "--float-delay": h.delay,
              "--float-duration": h.duration,
              "--float-x": h.x,
            } as CSSProperties
          }
        >
          <path
            fill="currentColor"
            d="M12 21s-7.5-4.6-10-9.3C.4 8.6 2.1 4.5 6 4.1c2.2-.2 4.1 1 6 3.1 1.9-2.1 3.8-3.3 6-3.1 3.9.4 5.6 4.5 4 7.6C19.5 16.4 12 21 12 21z"
          />
        </svg>
      ))}
    </div>
  );
}
