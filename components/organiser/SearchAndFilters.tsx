import Link from "next/link";
import { FilterChip, Icon } from "@/components/ui";
import type { ReplyStatus } from "@/lib/data/types";

export type StatusFilter = ReplyStatus | "all";

export const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "waiting", label: "No reply" },
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Declined" },
];

export function adminHref({ q, status }: { q?: string; status?: StatusFilter }) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (status && status !== "all") sp.set("status", status);
  const s = sp.toString();
  return s ? `/admin?${s}` : "/admin";
}

/** GET form, so search and filters live in the URL and work without JS. */
export function SearchAndFilters({
  q,
  status,
  counts,
}: {
  q: string;
  status: StatusFilter;
  counts: Record<StatusFilter, number>;
}) {
  return (
    <section aria-label="Find households" className="flex flex-col gap-3.5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-5">
      <form action="/admin" role="search" className="flex w-full flex-col gap-2 lg:max-w-[440px]">
        <label htmlFor="q" className="type-label">
          Search households
        </label>
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <div className="relative">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name, phone or family side"
            className="h-[52px] w-full rounded-input border border-border bg-field pr-[52px] pl-3.5 text-[17px] text-ink focus:border-2 focus:border-accent focus:pl-[13px] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q ? (
            <Link
              href={adminHref({ status })}
              aria-label="Clear search"
              className="absolute top-1 right-1 flex size-11 items-center justify-center text-ink-2 hover:text-ink"
            >
              <Icon name="close" />
            </Link>
          ) : (
            <button type="submit" aria-label="Search" className="absolute top-1 right-1 flex size-11 items-center justify-center border-0 bg-transparent text-ink-2 hover:text-ink">
              <Icon name="search" />
            </button>
          )}
        </div>
      </form>
      <nav aria-label="Filter by reply" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <FilterChip key={f.value} href={adminHref({ q, status: f.value })} active={status === f.value}>
            {f.label} · {counts[f.value]}
          </FilterChip>
        ))}
      </nav>
    </section>
  );
}
