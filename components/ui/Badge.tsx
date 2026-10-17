import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ReplyStatus } from "@/lib/data/types";

type Tone = "seats" | ReplyStatus;

const tones: Record<Tone, string> = {
  seats: "border border-accent text-accent px-3 text-[11px] tracking-[0.16em] uppercase",
  attending: "bg-success-tint text-success px-3 text-[14px]",
  declined: "bg-error-tint text-error px-3 text-[14px]",
  waiting: "bg-quiet-tint text-ink-2 px-3 text-[14px]",
};

export function Badge({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full py-1 leading-tight", tones[tone], className)}>
      {children}
    </span>
  );
}

export const statusLabel: Record<ReplyStatus, string> = {
  attending: "Attending",
  declined: "Declined",
  waiting: "No reply",
};
