import { Badge, statusLabel } from "@/components/ui";
import type { Household } from "@/lib/data/types";
import { answerLines } from "@/lib/households";
import { HouseholdActions } from "./HouseholdActions";

const sourceLabel = { request: "via request", open: "via open sign-up" } as const;

function Meta({ h }: { h: Household }) {
  return (
    <>
      {h.side && <>{h.side} · </>}
      <span className="whitespace-nowrap">{h.phone ?? "no phone"}</span>
      {h.source && h.source !== "list" && <> · {sourceLabel[h.source]}</>}
    </>
  );
}

function Answers({ h }: { h: Household }) {
  return (
    <>
      {answerLines(h).map((a, i) => (
        <span key={a.id}>
          {i > 0 && <br />}
          {a.label}: {a.text}
        </span>
      ))}
    </>
  );
}

/** Cards on phones and tablets; a table from 1024px. */
export function HouseholdList({ households }: { households: Household[] }) {
  return (
    <>
      <ul aria-label="Household list" className="m-0 flex list-none flex-col p-0 lg:hidden">
        {households.map((h) => (
          <li key={h.token} className="flex flex-col gap-2.5 border-b border-line py-[18px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-[18px] font-normal">{h.householdName}</h3>
                <p className="m-0 text-[14px] text-ink-2">
                  <Meta h={h} />
                </p>
              </div>
              <Badge tone={h.status}>{statusLabel[h.status]}</Badge>
            </div>
            <p className="m-0 text-[15px] leading-relaxed text-ink-2">
              <Answers h={h} />
            </p>
            {h.note && <p className="m-0 text-[15px] text-ink">&ldquo;{h.note}&rdquo;</p>}
            <HouseholdActions household={h} />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-[16px]">
          <caption className="sr-only">Households and their replies</caption>
          <thead>
            <tr>
              {["Household", "Status", "Answers", "Note"].map((c) => (
                <th key={c} scope="col" className="border-b-2 border-ink px-4 py-3 text-left text-[13px] font-normal uppercase tracking-[0.12em] text-ink-2">
                  {c}
                </th>
              ))}
              <th scope="col" className="border-b-2 border-ink px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {households.map((h) => (
              <tr key={h.token} className="align-top hover:bg-panel">
                <th scope="row" className="min-w-[240px] border-b border-line px-4 py-[18px] text-left font-normal">
                  {h.householdName}
                  <br />
                  <span className="text-[14px] text-ink-2">
                    <Meta h={h} />
                  </span>
                </th>
                <td className="border-b border-line px-4 py-[18px]">
                  <Badge tone={h.status}>{statusLabel[h.status]}</Badge>
                </td>
                <td className="whitespace-nowrap border-b border-line px-4 py-[18px] text-[15px] leading-relaxed text-ink-2">
                  <Answers h={h} />
                </td>
                <td className="min-w-[180px] border-b border-line px-4 py-[18px] text-[15px] leading-relaxed">
                  {h.note ? <>&ldquo;{h.note}&rdquo;</> : <span className="text-ink-2">—</span>}
                </td>
                <td className="border-b border-line px-4 py-[18px]">
                  <HouseholdActions household={h} inline />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
