"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Parts = { days: number; hours: number; mins: number; secs: number };

function remaining(target: number, now: number): Parts | null {
  const ms = target - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), mins: Math.floor((s % 3600) / 60), secs: s % 60 };
}

const LABELS: [keyof Parts, string, string][] = [
  ["days", "Day", "Days"],
  ["hours", "Hour", "Hours"],
  ["mins", "Min", "Mins"],
  ["secs", "Sec", "Secs"],
];

/**
 * Days · hours · minutes · seconds to `startsAt` (ISO). The server renders
 * the values at request time (`now`), so it reads right without JavaScript;
 * in the browser it ticks every second. On the day it says so; after, nothing.
 */
export function Countdown({ startsAt, now, sameDay, className }: { startsAt: string; now: number; sameDay: boolean; className?: string }) {
  const target = Date.parse(startsAt);
  const [t, setT] = useState(now);
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = remaining(target, t);
  if (!parts) {
    return sameDay ? <p className={cn("type-title m-0", className)}>Today&rsquo;s the day</p> : null;
  }

  return (
    <div role="timer" aria-live="off" className={cn("flex flex-col items-center gap-3", className)}>
      <p className="sr-only">
        {parts.days} {parts.days === 1 ? "day" : "days"} and {parts.hours} {parts.hours === 1 ? "hour" : "hours"} to go
      </p>
      <ol aria-hidden className="m-0 flex list-none items-start p-0">
        {LABELS.map(([key, one, many], i) => (
          <li key={key} className="flex items-start">
            {i > 0 && <span className="mx-2 mt-[14px] block size-1.5 rotate-45 bg-gold sm:mx-3" />}
            <span className="flex min-w-[56px] flex-col items-center gap-1.5">
              <span className="font-display text-[44px] font-light leading-none [font-variant-numeric:lining-nums_tabular-nums]">
                {key === "days" ? parts[key] : String(parts[key]).padStart(2, "0")}
              </span>
              <span className="type-eyebrow text-[11px]">{parts[key] === 1 ? one : many}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="type-eyebrow m-0" aria-hidden>
        To go
      </p>
    </div>
  );
}
