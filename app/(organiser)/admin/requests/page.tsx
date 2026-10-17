import type { Metadata } from "next";
import Link from "next/link";
import { BulkBar } from "@/components/organiser/BulkBar";
import { ExpandableRow } from "@/components/organiser/ExpandableRow";
import { HouseholdActions } from "@/components/organiser/HouseholdActions";
import { Badge, Icon, Notice } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import {
  defaultSeats,
  getInvitation,
  getSignupLinks,
  listJoinRequests,
  replyStatus,
  type Household,
  type JoinRequest,
  type SignupLink,
} from "@/lib/data";
import { approveRequest, approveSelected, declineRequest, declineSelected } from "../actions";

export const metadata: Metadata = { title: "Requests" };

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Accra" }).format(new Date(iso));

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/** Small pill buttons for the bulk bar. */
const rowBtn =
  "inline-flex h-11 items-center rounded-full px-4 text-[15px] font-semibold border transition-colors duration-150";
const approveCls = `${rowBtn} border-accent bg-accent text-on-accent hover:bg-accent-hover`;
const declineCls = `${rowBtn} border-border bg-field text-ink hover:bg-panel`;

/** Round icon buttons for each row: ✓ approve, ✕ decline. */
const iconBtn = "inline-flex size-11 flex-none items-center justify-center rounded-full border transition-colors duration-150";

/** "2 seats at every event" or "2 seats: Church, Reception". */
function seatSummary(seats: Partial<Record<string, number>>) {
  const invited = wedding.events.filter((e) => seats[e.id]);
  if (!invited.length) return "No seats";
  const counts = new Set(invited.map((e) => seats[e.id]));
  if (counts.size === 1) {
    const n = seats[invited[0].id]!;
    const label = `${n} ${n === 1 ? "seat" : "seats"}`;
    return invited.length === wedding.events.length ? `${label} at every event` : `${label}: ${invited.map((e) => e.shortName).join(", ")}`;
  }
  return invited.map((e) => `${e.shortName} ${seats[e.id]}`).join(", ");
}

/** Columns shared by the header and every row on wide screens. */
const cols = "lg:grid lg:grid-cols-[minmax(0,1.3fr)_100px_76px_minmax(0,2fr)] lg:gap-x-5";

function RequestRow({ r, link }: { r: JoinRequest; link: SignupLink }) {
  const seats = defaultSeats(r, link);
  return (
    <ExpandableRow
      label={`details for ${r.name}`}
      className="lg:px-4 lg:hover:bg-panel"
      select={<input type="checkbox" name="ids" value={r.id} aria-label={`Select ${r.name}`} className="size-5 accent-accent" />}
      summary={
        <span className={`block ${cols} lg:items-center`}>
          <span className="block min-w-0">
            <span className="block truncate text-[16px]">{r.name}</span>
            <span className="block truncate text-[13px] text-ink-2 lg:hidden">
              {people(r.partySize)} · {when(r.createdAt)}
              {r.message && " · has a message"}
            </span>
            <span className="hidden truncate text-[13px] text-ink-2 lg:block">{r.side ?? r.phone}</span>
          </span>
          <span className="hidden text-[15px] lg:block">{people(r.partySize)}</span>
          <span className="hidden text-[14px] text-ink-2 lg:block">{when(r.createdAt)}</span>
          <span className="hidden truncate text-[15px] text-ink-2 lg:block">{r.message ? <>&ldquo;{r.message}&rdquo;</> : "—"}</span>
        </span>
      }
      actions={
        <>
          <button
            type="submit"
            formAction={approveRequest.bind(null, r.id)}
            aria-label={`Approve ${r.name}`}
            title="Approve"
            className={`${iconBtn} border-accent bg-accent text-on-accent hover:bg-accent-hover`}
          >
            <Icon name="check" size={20} />
          </button>
          <button
            type="submit"
            formAction={declineRequest.bind(null, r.id)}
            aria-label={`Decline ${r.name}`}
            title="Decline"
            className={`${iconBtn} border-border bg-field text-ink-2 hover:bg-panel hover:text-ink`}
          >
            <Icon name="close" size={18} />
          </button>
        </>
      }
      panel={
        <div className="flex flex-col gap-3 bg-panel p-3 text-[15px] lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-10">
          <div className="flex flex-col gap-1 lg:max-w-[460px]">
            <p className="m-0 text-ink-2">{[r.side, r.phone].filter(Boolean).join(" · ")}</p>
            {r.message && <p className="m-0">&ldquo;{r.message}&rdquo;</p>}
          </div>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 p-0 text-[14px] text-ink-2">If approved: {seatSummary(seats)}. Change any:</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {wedding.events.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-[14px]">
                  {e.shortName}
                  <input
                    type="number"
                    name={`seats_${r.id}_${e.id}`}
                    min={0}
                    max={10}
                    inputMode="numeric"
                    defaultValue={seats[e.id] ?? 0}
                    className="h-10 w-14 rounded-input border border-border bg-field px-2 text-[16px] text-ink focus:border-2 focus:border-accent focus:px-[7px] focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <p className="m-0 mt-1.5 text-[13px] text-ink-2">0 = not invited to that event.</p>
          </fieldset>
        </div>
      }
    />
  );
}

export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const [pending, allPending, everything, links] = await Promise.all([
    listJoinRequests("pending", q),
    listJoinRequests("pending"),
    listJoinRequests(),
    getSignupLinks(),
  ]);
  const done = everything.filter((r) => r.status !== "pending").reverse();

  const approvedIds = typeof sp.approved === "string" ? sp.approved.split(",") : [];
  const approved: Household[] = [];
  for (const id of approvedIds) {
    const r = everything.find((x) => x.id === id);
    const inv = r?.token ? await getInvitation(r.token) : null;
    if (inv) approved.push({ ...inv, status: replyStatus(inv) });
  }
  const declined = typeof sp.declined === "string" ? Number(sp.declined) : 0;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-org-title m-0">Requests</h1>
        <p className="m-0 max-w-[680px] text-ink-2">
          People who asked for a place through the shared link, oldest first. Tap a name for details or to change seats,
          then ✓ to approve or ✕ to decline. Tick several to do them together.
        </p>
      </div>

      {approved.length > 0 && (
        <Notice tone="success" icon="check" title={`${approved.length} approved. Send their invitations:`}>
          <ul className="m-0 mt-2 flex list-none flex-col p-0">
            {approved.map((h) => (
              <li key={h.token} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-success/20 py-2">
                <span>{h.householdName}</span>
                <HouseholdActions household={h} />
              </li>
            ))}
          </ul>
        </Notice>
      )}
      {declined > 0 && (
        <Notice tone="info" icon="check">
          {declined === 1 ? "1 request" : `${declined} requests`} declined.
        </Notice>
      )}
      {sp.error === "none" && <Notice tone="error">Tick at least one request first.</Notice>}
      {sp.error === "seats" && <Notice tone="error">Give at least one seat, or decline the request.</Notice>}
      {!links.request.enabled && (
        <Notice tone="info" icon="lock">
          The request link is off, so no new requests can come in. <Link href="/admin/links">Turn it on in Sign-up links</Link>.
        </Notice>
      )}

      <section aria-labelledby="pending" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="pending" className="type-label m-0 font-normal text-ink-2">
            Waiting for you · {allPending.length}
          </h2>
          {allPending.length > 5 && (
            <form action="/admin/requests" role="search" className="relative w-full lg:w-[360px]">
              <label htmlFor="rq" className="sr-only">
                Search requests
              </label>
              <input
                id="rq"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search name, phone or message"
                className="h-11 w-full rounded-input border border-border bg-field pr-11 pl-3 text-[16px] text-ink focus:border-2 focus:border-accent focus:pl-[11px] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {q ? (
                <Link href="/admin/requests" aria-label="Clear search" className="absolute top-0 right-0 flex size-11 items-center justify-center text-ink-2">
                  <Icon name="close" />
                </Link>
              ) : (
                <button type="submit" aria-label="Search" className="absolute top-0 right-0 flex size-11 items-center justify-center border-0 bg-transparent text-ink-2">
                  <Icon name="search" />
                </button>
              )}
            </form>
          )}
        </div>

        {pending.length ? (
          <form className="flex flex-col">
            <BulkBar total={pending.length}>
              <button type="submit" formAction={approveSelected} className={approveCls}>
                Approve selected
              </button>
              <button type="submit" formAction={declineSelected} className={declineCls}>
                Decline selected
              </button>
            </BulkBar>
            <div aria-hidden className="hidden items-center gap-3 border-b-2 border-ink px-4 py-2.5 text-[13px] uppercase tracking-[0.12em] text-ink-2 lg:flex">
              <span className="w-5 flex-none" />
              <span className={`flex-1 pl-5 ${cols}`}>
                <span>Name</span>
                <span>Asked for</span>
                <span>Asked</span>
                <span>Message</span>
              </span>
              <span className="w-[94px] flex-none text-right">Approve</span>
            </div>
            <ul className="m-0 list-none p-0">
              {pending.map((r) => (
                <RequestRow key={r.id} r={r} link={links.request} />
              ))}
            </ul>
          </form>
        ) : (
          <p className="m-0 bg-panel px-4 py-8 text-center text-ink-2">
            {q ? <>No waiting requests match &ldquo;{q}&rdquo;.</> : "No requests waiting."}
          </p>
        )}
      </section>

      {done.length > 0 && (
        <details className="group border-t border-line pt-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[14px] uppercase tracking-[0.08em] text-ink-2 [&::-webkit-details-marker]:hidden">
            <Icon name="chevron" size={16} className="transition-transform group-open:rotate-180" />
            Decided · {done.length}
          </summary>
          <ul className="m-0 list-none p-0">
            {done.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2.5">
                <span>
                  {r.name} <span className="text-[14px] text-ink-2">· {people(r.partySize)} · {r.phone}</span>
                </span>
                <span className="flex items-center gap-4">
                  <Badge tone={r.status === "approved" ? "attending" : "declined"}>{r.status === "approved" ? "Approved" : "Declined"}</Badge>
                  {r.token && (
                    <Link href={`/i/${r.token}`} target="_blank" className="flex min-h-11 items-center text-[15px]">
                      View invite
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
