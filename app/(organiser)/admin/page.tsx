import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HeadcountCards } from "@/components/organiser/HeadcountCards";
import { HouseholdList } from "@/components/organiser/HouseholdList";
import { adminHref, FILTERS, SearchAndFilters, type StatusFilter } from "@/components/organiser/SearchAndFilters";
import { Button, Icon } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { getHeadcount, getOrganiser, listHouseholds } from "@/lib/data";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const organiser = await getOrganiser();
  if (!organiser) redirect("/login");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = (FILTERS.some((f) => f.value === sp.status) ? sp.status : "all") as StatusFilter;

  const [all, headcount] = await Promise.all([listHouseholds(), getHeadcount()]);
  const households = await listHouseholds({ q, status: status === "all" ? undefined : status });

  const counts: Record<StatusFilter, number> = {
    all: all.length,
    waiting: all.filter((h) => h.status === "waiting").length,
    attending: all.filter((h) => h.status === "attending").length,
    declined: all.filter((h) => h.status === "declined").length,
  };
  const replied = all.length - counts.waiting;
  const filterLabel = FILTERS.find((f) => f.value === status)?.label;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-7 px-5 pt-6 pb-12 lg:gap-10 lg:px-6 lg:pt-10 lg:pb-16">
      <header className="flex flex-col gap-1.5 lg:flex-row-reverse lg:items-end lg:justify-between lg:gap-6">
        <div className="flex items-center justify-between gap-4 text-[14px] text-ink-2 lg:text-[15px]">
          <span>{organiser.email}</span>
          <Link href="/login" className="flex min-h-11 items-center">
            Sign out
          </Link>
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-script text-[44px] font-normal leading-tight lg:text-[56px]">{wedding.coupleNames}</h1>
          <p className="m-0 text-[18px] lg:text-[19px]">
            {replied} of {all.length} households have replied
            <span className="hidden lg:inline"> · RSVP closes {longDate(wedding.rsvpDeadline)}</span>
          </p>
        </div>
      </header>

      <HeadcountCards headcount={headcount} />

      <main className="flex flex-col gap-6">
        <SearchAndFilters q={q} status={status} counts={counts} />

        {households.length > 0 ? (
          <>
            <HouseholdList households={households} />
            <p className="m-0 text-center text-[14px] text-ink-2 lg:text-left">
              Showing {households.length} of {all.length} · numbers update when you refresh
            </p>
          </>
        ) : (
          <section role="status" className="flex flex-col items-center gap-3.5 bg-panel px-3 py-12 text-center">
            <Icon name="search" size={32} className="text-ink-2" />
            <p className="m-0 text-[18px]">
              No households match {q ? <>&ldquo;{q}&rdquo;</> : "this filter"}
              {status !== "all" && <> in {filterLabel}</>}
            </p>
            <p className="m-0 text-[16px] text-ink-2">Check the spelling, search by phone number, or look in all households.</p>
            <Button href={adminHref({ q })} variant="secondary" className="!h-11 px-[22px]">
              {status !== "all" ? `Search all ${all.length}` : "Clear search"}
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
