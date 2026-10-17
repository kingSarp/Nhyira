import type { Metadata } from "next";
import Link from "next/link";
import { HouseholdActions } from "@/components/organiser/HouseholdActions";
import { Badge, Button, Icon, Notice } from "@/components/ui";
import { cn } from "@/lib/cn";
import { wedding } from "@/lib/content/wedding";
import { getInvitation, getSignupLinks, listJoinRequests, replyStatus, type JoinRequest } from "@/lib/data";
import { approveRequest, declineRequest } from "../actions";

export const metadata: Metadata = { title: "Requests" };

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra" }).format(new Date(iso));

function RequestCard({ r, error }: { r: JoinRequest; error: boolean }) {
  return (
    <li className="flex flex-col gap-4 border-t-2 border-ink pt-4 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[18px] font-normal">{r.name}</h3>
          <p className="m-0 text-[14px] text-ink-2">
            {[r.side, r.phone].filter(Boolean).join(" · ")} · asked {when(r.createdAt)}
          </p>
        </div>
        <Badge tone="waiting">
          <Icon name="users" size={14} className="mr-1.5" />
          {r.partySize} {r.partySize === 1 ? "person" : "people"}
        </Badge>
      </div>
      {r.message && <p className="m-0 text-[15px]">&ldquo;{r.message}&rdquo;</p>}

      <form action={approveRequest.bind(null, r.id)} className="flex flex-col gap-3 bg-panel p-4">
        <fieldset className="m-0 border-0 p-0">
          <legend className="type-label mb-2 p-0">Seats to give, per event</legend>
          <div className="grid grid-cols-3 gap-3">
            {wedding.events.map((e) => (
              <label key={e.id} className="flex flex-col gap-1 text-[14px] text-ink-2">
                {e.shortName}
                <input
                  type="number"
                  name={`seats_${e.id}`}
                  min={0}
                  max={10}
                  defaultValue={r.partySize}
                  inputMode="numeric"
                  className="h-11 w-full rounded-input border border-border bg-field px-3 text-[17px] text-ink focus:border-2 focus:border-accent focus:px-[11px] focus:outline-none"
                />
              </label>
            ))}
          </div>
          <p className={cn("m-0 mt-2 text-[14px]", error ? "text-error" : "text-ink-2")}>
            {error ? "Give at least one seat, or decline the request." : "0 means not invited to that event."}
          </p>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Approve</Button>
          <Button type="submit" variant="secondary" formAction={declineRequest.bind(null, r.id)}>
            Decline
          </Button>
        </div>
      </form>
    </li>
  );
}

export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  const sp = await searchParams;
  const [pending, decided, links] = await Promise.all([listJoinRequests("pending"), listJoinRequests(), getSignupLinks()]);
  const done = decided.filter((r) => r.status !== "pending");

  const approved = typeof sp.approved === "string" ? decided.find((r) => r.id === sp.approved) : undefined;
  const approvedInv = approved?.token ? await getInvitation(approved.token) : null;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-org-title m-0">Requests</h1>
        <p className="m-0 text-ink-2">
          People who asked for a place through the shared link. Approving gives them a personal invitation.
        </p>
      </div>

      {approvedInv && (
        <Notice tone="success" icon="check" title={`${approvedInv.householdName} approved`}>
          <span className="mb-3 block">Send their personal invitation now:</span>
          <HouseholdActions household={{ ...approvedInv, status: replyStatus(approvedInv) }} />
        </Notice>
      )}

      {!links.request.enabled && (
        <Notice tone="info" icon="lock">
          The request link is off, so no new requests can come in. <Link href="/admin/links">Turn it on in Sign-up links</Link>.
        </Notice>
      )}

      <section aria-labelledby="pending" className="flex flex-col gap-4">
        <h2 id="pending" className="type-label m-0 font-normal text-ink-2">
          Waiting for you · {pending.length}
        </h2>
        {pending.length ? (
          <ul className="m-0 grid list-none gap-x-8 gap-y-2 p-0 lg:grid-cols-2">
            {pending.map((r) => (
              <RequestCard key={r.id} r={r} error={sp.error === r.id} />
            ))}
          </ul>
        ) : (
          <p className="m-0 bg-panel px-4 py-8 text-center text-ink-2">No requests waiting.</p>
        )}
      </section>

      {done.length > 0 && (
        <section aria-labelledby="decided" className="flex flex-col gap-2">
          <h2 id="decided" className="type-label m-0 font-normal text-ink-2">
            Decided · {done.length}
          </h2>
          <ul className="m-0 list-none p-0">
            {done.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
                <span>
                  {r.name} <span className="text-[14px] text-ink-2">· {r.phone}</span>
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
        </section>
      )}
    </main>
  );
}
