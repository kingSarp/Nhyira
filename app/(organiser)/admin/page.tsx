import type { Metadata } from "next";
import { needsInvite } from "@/lib/households";
import Link from "next/link";
import { HeadcountCards } from "@/components/organiser/HeadcountCards";
import { HouseholdList } from "@/components/organiser/HouseholdList";
import { adminHref, FILTERS, SearchAndFilters, type StatusFilter } from "@/components/organiser/SearchAndFilters";
import { Button, Icon, Notice } from "@/components/ui";
import { getHeadcount, getInvitation, listHouseholds, getWedding } from "@/lib/data";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
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
  const toSend = all.filter((h) => !h.sentAt && h.phone && needsInvite(h)).length;
  const toRemind = all.filter((h) => h.sentAt && h.status === "waiting").length;
  const saved = typeof sp.saved === "string" ? await getInvitation(sp.saved) : null;
  const filterLabel = FILTERS.find((f) => f.value === status)?.label;

  return (
    <main className="flex flex-col gap-7 lg:gap-10">
      <div>
        <h1 className="sr-only">Guests</h1>
        <p className="m-0 text-[18px] lg:text-[19px]">
          {replied} of {all.length} households have replied
          <span className="hidden lg:inline"> · RSVP closes {longDate((await getWedding()).rsvpDeadline)}</span>
        </p>
      </div>

      {saved && (
        <Notice tone="success" icon="check" title={`${saved.householdName} saved`}>
          <Link href={`/i/${saved.token}`} target="_blank">View their invite</Link>
          {saved.phone && !saved.sentAt && (
            <>
              {" · "}
              <a href={`/admin/send/${saved.token}`} target="_blank" rel="noopener noreferrer">
                Send it on WhatsApp now
              </a>
            </>
          )}
        </Notice>
      )}
      {typeof sp.imported === "string" && (
        <Notice tone="success" icon="check" title={`${sp.imported} households added`}>
          Next: <Link href="/admin/send">send their invites</Link>.
        </Notice>
      )}
      {typeof sp.removed === "string" && <Notice tone="info" icon="check">{sp.removed} was removed from the guest list.</Notice>}

      <HeadcountCards headcount={headcount} />

      <section aria-label="Households" className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button href="/admin/guests/new" className="!h-11 gap-1.5 !px-4 text-[14px]">
            <Icon name="plus" size={16} /> Add<span className="hidden sm:inline"> household</span>
          </Button>
          <Button href="/admin/guests/import" variant="secondary" className="!h-11 gap-1.5 !px-4 text-[14px]">
            <Icon name="upload" size={16} /> Import
          </Button>
          {(toSend > 0 || toRemind > 0) && (
            <Button href={toSend > 0 ? "/admin/send" : "/admin/send?mode=remind"} variant="whatsapp" className="col-span-2 !h-11">
              {toSend > 0 ? `Send invites · ${toSend}` : `Send reminders · ${toRemind}`}
            </Button>
          )}
        </div>

        <SearchAndFilters q={q} status={status} counts={counts} />

        {all.length === 0 ? (
          <section className="flex flex-col items-center gap-3.5 bg-panel px-3 py-12 text-center">
            <p className="m-0 text-[18px]">Your guest list is empty</p>
            <p className="m-0 text-[16px] text-ink-2">Add households one by one, or import your whole list from a spreadsheet.</p>
          </section>
        ) : households.length > 0 ? (
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
      </section>
    </main>
  );
}
