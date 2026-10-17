"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * A list row that opens a details panel under it, full width.
 * The panel stays in the DOM when closed (hidden), so its inputs still submit.
 */
export function ExpandableRow({
  select,
  summary,
  actions,
  panel,
  label,
  className,
}: {
  select?: ReactNode;
  summary: ReactNode;
  actions: ReactNode;
  panel: ReactNode;
  /** e.g. "details for Kojo Antwi" */
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li
      className={cn(
        "grid items-start gap-x-3 border-b border-line py-1.5",
        select ? "grid-cols-[20px_minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto]",
        className,
      )}
    >
      {select && <div className="pt-[14px]">{select}</div>}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${open ? "Hide" : "Show"} ${label}`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 w-full min-w-0 items-center gap-1.5 border-0 bg-transparent py-1 text-left text-ink"
      >
        <Icon name="chevron" size={14} className={cn("flex-none text-ink-2 transition-transform", open && "rotate-180")} />
        <span className="min-w-0 flex-1">{summary}</span>
      </button>
      <div className="flex gap-1.5 pt-0.5">{actions}</div>
      <div id={id} hidden={!open} className={cn("col-span-2 pb-3", select ? "col-start-2" : undefined)}>
        {panel}
      </div>
    </li>
  );
}
