import type { Metadata } from "next";
import Link from "next/link";
import { SendNext } from "@/components/organiser/SendNext";
import { Badge, FilterChip, Notice, statusLabel } from "@/components/ui";
import { listHouseholds } from "@/lib/data";
import { toWhatsAppNumber } from "@/lib/format";
import { inviteMessage, seatLine } from "@/lib/households";

export const metadata: Metadata = { title: "Send invites" };

/**
 * One household at a time: open WhatsApp, send, come back, next.
 * WhatsApp has no free bulk send, so this makes the one-by-one part quick.
 */
export default async function SendPage({ searchParams }: PageProps<"/admin/send">) {
  const sp = await searchParams;
  const mode = sp.mode === "remind" ? "remind" : "new";
  const skipped = typeof sp.skip === "string" ? sp.skip.split(",") : [];

  const all = (await listHouseholds()).filter((h) => toWhatsAppNumber(h.phone));
  const queue =
    mode === "new"
      ? all.filter((h) => !h.sentAt)
      : all.filter((h) => h.sentAt && h.status === "waiting");
  const remaining = queue.filter((h) => !skipped.includes(h.token));
  const current = remaining[0];
  const noPhone = (await listHouseholds()).filter((h) => !toWhatsAppNumber(h.phone)).length;
  const kind = mode === "remind" ? "reminder" : "invite";

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin" className="flex min-h-11 items-center self-start text-[15px]">
          ← Guests
        </Link>
        <h1 className="type-org-title m-0">{mode === "new" ? "Send invites" : "Send reminders"}</h1>
        <p className="m-0 max-w-[620px] text-ink-2">
          One household at a time. Tap send, press send in WhatsApp, then come back here and the next one is ready.
        </p>
      </div>

      <nav aria-label="What to send" className="flex flex-wrap gap-2">
        <FilterChip href="/admin/send" active={mode === "new"}>
          Not sent yet · {all.filter((h) => !h.sentAt).length}
        </FilterChip>
        <FilterChip href="/admin/send?mode=remind" active={mode === "remind"}>
          Sent, no reply · {all.filter((h) => h.sentAt && h.status === "waiting").length}
        </FilterChip>
      </nav>

      {current ? (
        <section aria-labelledby="current" className="flex max-w-[620px] flex-col gap-5 border-t-2 border-ink pt-5">
          <p className="m-0 text-[14px] text-ink-2">
            {queue.length - remaining.length + 1} of {queue.length}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="current" className="m-0 text-[24px] font-normal">
                {current.householdName}
              </h2>
              <p className="m-0 text-[15px] text-ink-2">
                {[current.side, current.phone, seatLine(current)].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Badge tone={current.status}>{statusLabel[current.status]}</Badge>
          </div>

          <figure className="m-0 flex flex-col gap-1.5">
            <figcaption className="type-label text-ink-2">Message</figcaption>
            <blockquote className="m-0 whitespace-pre-line bg-panel p-4 text-[15px]">{inviteMessage(current, kind)}</blockquote>
          </figure>

          <div className="flex flex-wrap items-center gap-4">
            <SendNext href={`/admin/send/${current.token}?kind=${kind}`} label={mode === "new" ? "Send on WhatsApp" : "Send reminder"} />
            <Link
              href={`/admin/send?${new URLSearchParams({ ...(mode === "remind" ? { mode } : {}), skip: [...skipped, current.token].join(",") })}`}
              className="flex min-h-11 items-center"
            >
              Skip for now
            </Link>
          </div>
        </section>
      ) : (
        <Notice tone="success" icon="check" title={queue.length ? "All done" : mode === "new" ? "Everyone has been sent their invite" : "No one to remind"}>
          {mode === "new" ? (
            <>
              Every household with a phone number has their invite. Later, use <Link href="/admin/send?mode=remind">Sent, no reply</Link> to nudge anyone who hasn&apos;t answered.
            </>
          ) : (
            "Everyone you've sent to has replied."
          )}
        </Notice>
      )}

      {noPhone > 0 && (
        <p className="m-0 text-[14px] text-ink-2">
          {noPhone} {noPhone === 1 ? "household has" : "households have"} no phone number and can&apos;t be sent to. Add one from the Guests list.
        </p>
      )}
    </main>
  );
}
