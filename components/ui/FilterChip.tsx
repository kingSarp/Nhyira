import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A filter that is a link, so filters live in the URL and work without JS. */
export function FilterChip({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-11 items-center rounded-full border px-4 text-[15px] no-underline",
        active
          ? "border-ink bg-ink text-paper hover:text-paper"
          : "border-border bg-field text-ink hover:bg-panel hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
