"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { ImportState } from "@/app/(organiser)/admin/guests/actions";
import { Button, Notice } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";

type Action = (prev: ImportState, form: FormData) => Promise<ImportState>;

export function ImportForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle" && state.status !== "editing") top.current?.focus();
  }, [state]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name) data.set(submitter.name, submitter.value);
    startTransition(() => formAction(data));
  };

  const text = state.status === "idle" ? "" : state.text;

  if (state.status === "preview") {
    const bad = state.rows.filter((r) => !r.value || r.duplicate);
    return (
      <form action={formAction} onSubmit={submit} className="flex flex-col gap-5">
        <input type="hidden" name="text" value={state.text} />
        <div ref={top} tabIndex={-1} className="outline-none">
          <Notice tone={state.ready ? "success" : "error"} icon={state.ready ? "check" : "alert"} title={`${state.ready} of ${state.rows.length} ready to add`}>
            {bad.length
              ? `${bad.length} ${bad.length === 1 ? "row needs" : "rows need"} fixing and will be skipped. Fix them in your sheet and import again later, or add them by hand.`
              : "Everything looks right."}
          </Notice>
        </div>

        {bad.length > 0 && (
          <section aria-labelledby="to-fix" className="flex flex-col gap-2">
            <h2 id="to-fix" className="type-label m-0 font-normal text-error">
              To fix · {bad.length}
            </h2>
            <ul className="m-0 list-none border-t-2 border-error p-0">
              {bad.map((r) => (
                <li key={r.line} className="flex flex-col gap-0.5 border-b border-line py-2.5 text-[15px]">
                  <span>
                    <span className="text-ink-2">Row {r.line} · </span>
                    {r.fields.householdName || "No name"}
                    {r.fields.phone && <span className="text-ink-2"> · {r.fields.phone}</span>}
                  </span>
                  <span className="text-[14px] text-error">{[...r.problems, r.duplicate].filter(Boolean).join(" ")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <details className="group" open={state.rows.length <= 20}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[15px] [&::-webkit-details-marker]:hidden">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="transition-transform group-open:rotate-180">
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span className="underline underline-offset-[3px]">See the {state.ready} ready {state.ready === 1 ? "row" : "rows"}</span>
          </summary>
          <div className="mt-2 max-h-[60vh] overflow-auto border-t-2 border-ink">
            <table className="w-full min-w-[640px] border-collapse text-[15px]">
              <caption className="sr-only">Rows ready to add</caption>
              <thead className="sticky top-0 bg-paper">
                <tr className="text-left text-[13px] uppercase tracking-[0.12em] text-ink-2">
                  <th scope="col" className="w-14 px-3 py-2.5 font-normal">Row</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Household</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Phone</th>
                  {wedding.events.map((e) => (
                    <th key={e.id} scope="col" className="w-24 px-3 py-2.5 font-normal">
                      {e.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.rows
                  .filter((r) => r.value && !r.duplicate)
                  .map((r) => (
                    <tr key={r.line} className="border-t border-line align-top">
                      <td className="px-3 py-2 text-ink-2">{r.line}</td>
                      <td className="px-3 py-2">
                        {r.fields.householdName}
                        {r.fields.side && <span className="block text-[13px] text-ink-2">{r.fields.side}</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{r.fields.phone || <span className="text-ink-2">none</span>}</td>
                      {wedding.events.map((e) => (
                        <td key={e.id} className="px-3 py-2">
                          {r.fields.seats[e.id] || <span className="text-ink-2">–</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" name="step" value="confirm" disabled={pending || !state.ready}>
            {pending ? "Adding…" : `Add ${state.ready} ${state.ready === 1 ? "household" : "households"}`}
          </Button>
          <Button type="submit" name="step" value="edit" variant="secondary" disabled={pending}>
            Back to edit
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction} onSubmit={submit} className="flex max-w-[760px] flex-col gap-5">
      <div ref={top} tabIndex={-1} className="outline-none empty:hidden">
        {state.status === "error" && <Notice tone="error">{state.message}</Notice>}
      </div>

      <ol className="m-0 flex flex-col gap-2 pl-5 text-[15px] text-ink-2">
        <li>
          Put one household per row with these columns: <strong className="font-semibold text-ink">Name, Greeting, Phone, Side, Engagement, Church, Reception</strong>. Only Name and one event are required.
        </li>
        <li>
          In each event column, write how many seats they get. Leave it blank if they aren&apos;t invited. <a href="/guest-list-template.csv" download>Download a template</a>.
        </li>
        <li>Copy the rows from Excel or Google Sheets (including the header row) and paste below, or choose a CSV file.</li>
      </ol>

      <label className="flex flex-col gap-2">
        <span className="type-label">Paste your list</span>
        <textarea
          name="text"
          rows={10}
          defaultValue={text}
          spellCheck={false}
          placeholder={"Name\tGreeting\tPhone\tSide\tEngagement\tChurch\tReception\nKwame & Ama Boateng\tKwame & Ama\t024 000 0001\tGroom's family\t2\t2\t2"}
          className="w-full rounded-input border border-border bg-field px-3.5 py-3 font-mono text-[14px] leading-relaxed text-ink focus:border-2 focus:border-accent focus:px-[13px] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="type-label">Or choose a CSV file</span>
        <input type="file" name="file" accept=".csv,.tsv,.txt,text/csv" className="text-[15px] file:mr-4 file:h-11 file:rounded-full file:border file:border-ink file:bg-transparent file:px-4 file:text-[15px] file:text-ink" />
      </label>

      <div>
        <Button type="submit" name="step" value="preview" disabled={pending}>
          {pending ? "Checking…" : "Check my list"}
        </Button>
      </div>
    </form>
  );
}
