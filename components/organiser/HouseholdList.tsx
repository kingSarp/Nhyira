import Link from "next/link";
import { Badge, Icon, statusLabel } from "@/components/ui";
import type { Household } from "@/lib/data/types";
import { toWhatsAppNumber } from "@/lib/format";
import { answerLines, seatLine, sentLabel } from "@/lib/households";
import { ExpandableRow } from "./ExpandableRow";

const sourceLabel = { list: "Added by you", request: "Via request", open: "Via open sign-up" } as const;

/** Columns shared by the header and each row on wide screens. */
export const householdCols = "lg:grid lg:grid-cols-[minmax(0,1.4fr)_110px_minmax(0,1fr)_120px] lg:items-center lg:gap-x-5";

const iconBtn = "inline-flex size-11 flex-none items-center justify-center rounded-full border transition-colors duration-150";

function Row({ h }: { h: Household }) {
  const canSend = !!toWhatsAppNumber(h.phone);
  const kind = h.sentAt && h.status === "waiting" ? "reminder" : "invite";
  return (
    <ExpandableRow
      label={`details for ${h.householdName}`}
      className="lg:px-4 lg:hover:bg-panel"
      summary={
        <span className={`block ${householdCols}`}>
          <span className="block min-w-0">
            <span className="block truncate text-[16px]">{h.householdName}</span>
            <span className="block truncate text-[13px] text-ink-2 lg:hidden">
              {statusLabel[h.status]} · {seatLine(h)} · {canSend ? sentLabel(h) : "no phone"}
            </span>
            <span className="hidden truncate text-[13px] text-ink-2 lg:block">{h.side ?? h.phone ?? "—"}</span>
          </span>
          <span className="hidden lg:block">
            <Badge tone={h.status}>{statusLabel[h.status]}</Badge>
          </span>
          <span className="hidden truncate text-[14px] text-ink-2 lg:block">{seatLine(h)}</span>
          <span className="hidden text-[14px] text-ink-2 lg:block">{canSend ? sentLabel(h) : "No phone"}</span>
        </span>
      }
      actions={
        <>
          {canSend ? (
            <a
              href={`/admin/send/${h.token}?kind=${kind}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${kind === "reminder" ? "Send a reminder" : "Send invite"} to ${h.householdName} on WhatsApp`}
              title={kind === "reminder" ? "Send a reminder" : "Send on WhatsApp"}
              className={`${iconBtn} border-success text-success hover:bg-success-tint hover:text-success`}
            >
              <Icon name="whatsapp" size={19} />
            </a>
          ) : (
            <Link
              href={`/admin/guests/${h.token}`}
              aria-label={`Add a phone number for ${h.householdName}`}
              title="Add a phone number"
              className={`${iconBtn} border-dashed border-border text-ink-2 hover:bg-panel hover:text-ink`}
            >
              <Icon name="whatsapp" size={19} />
            </Link>
          )}
          <Link
            href={`/admin/guests/${h.token}`}
            aria-label={`Edit ${h.householdName}`}
            title="Edit"
            className={`${iconBtn} border-border bg-field text-ink-2 hover:bg-panel hover:text-ink`}
          >
            <Icon name="pencil" size={18} />
          </Link>
        </>
      }
      panel={
        <div className="flex flex-col gap-3 bg-panel p-3 text-[15px] lg:flex-row lg:flex-wrap lg:gap-x-10">
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
            <dt className="text-ink-2">Phone</dt>
            <dd className="m-0">{h.phone ?? "None yet"}</dd>
            {h.side && (
              <>
                <dt className="text-ink-2">Side</dt>
                <dd className="m-0">{h.side}</dd>
              </>
            )}
            <dt className="text-ink-2">Added</dt>
            <dd className="m-0">{sourceLabel[h.source ?? "list"]}</dd>
            <dt className="text-ink-2">Invite</dt>
            <dd className="m-0">{canSend ? sentLabel(h) : "Can't send without a phone"}</dd>
          </dl>
          <div className="flex flex-col gap-1">
            <p className="m-0 text-[14px] text-ink-2">Answers</p>
            {answerLines(h).map((a) => (
              <p key={a.id} className="m-0 text-[14px]">
                {a.label}: {a.text}
              </p>
            ))}
            {h.note && <p className="m-0 mt-1">&ldquo;{h.note}&rdquo;</p>}
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:ml-auto lg:self-start">
            <Link href={`/i/${h.token}`} target="_blank" className="flex min-h-11 items-center text-[15px]">
              View invite
            </Link>
            <Link href={`/admin/guests/${h.token}`} className="flex min-h-11 items-center text-[15px]">
              Edit or remove
            </Link>
          </div>
        </div>
      }
    />
  );
}

/** One line per household; tap to see answers and details. */
export function HouseholdList({ households }: { households: Household[] }) {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="hidden items-center gap-3 border-b-2 border-ink px-4 py-2.5 text-[13px] uppercase tracking-[0.12em] text-ink-2 lg:flex">
        <span className={`flex-1 pl-5 ${householdCols}`}>
          <span>Household</span>
          <span>Reply</span>
          <span>Seats</span>
          <span>Invite</span>
        </span>
        <span className="w-[94px] flex-none text-right">Send · Edit</span>
      </div>
      <ul aria-label="Household list" className="m-0 list-none p-0">
        {households.map((h) => (
          <Row key={h.token} h={h} />
        ))}
      </ul>
    </div>
  );
}
