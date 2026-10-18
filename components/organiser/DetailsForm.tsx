"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import { saveDetails } from "@/app/(organiser)/admin/details/actions";
import { Button, ErrorSummary, Notice, TextField } from "@/components/ui";
import { EVENTS } from "@/lib/content/wedding";
import { summaryTitle } from "@/lib/rsvp";
import { MAX_COLOURS, type DetailsFormState } from "@/lib/wedding-form";

function Group({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset aria-labelledby={id} className="m-0 flex flex-col gap-5 border-0 border-t-2 border-ink p-0 pt-5">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="m-0 text-[22px] font-normal">
          {title}
        </h2>
        {description && <p className="m-0 text-[15px] text-ink-2">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

const pair = "grid gap-5 sm:grid-cols-2";

/** Everything on /admin/details except the story photos. One save for all. */
export function DetailsForm({ initial }: { initial: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<DetailsFormState, FormData>(saveDetails, { status: "idle" });
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle") top.current?.focus();
  }, [state]);

  const v = state.status === "invalid" ? state.values : initial;
  const errors = state.status === "invalid" ? state.errors.fields : {};
  const text = (id: string, label: string, extra: Partial<Parameters<typeof TextField>[0]> = {}) => (
    <TextField id={id} name={id} label={label} defaultValue={v[id]} error={errors[id]} {...extra} />
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex max-w-[760px] flex-col gap-10"
    >
      <div ref={top} tabIndex={-1} className="outline-none empty:hidden">
        {state.status === "invalid" && <ErrorSummary title={summaryTitle(state.errors.summary.length)} errors={state.errors.summary} />}
        {state.status === "saved" && (
          <Notice tone="success" icon="check" title="Saved">
            Guests see the changes the next time they open their invitation.
          </Notice>
        )}
      </div>

      <Group id="couple-title" title="The couple" description="Shown on every invitation and on the WhatsApp preview card.">
        <div className={pair}>
          {text("partnerA", "First name", { maxLength: 40, autoComplete: "off" })}
          {text("partnerB", "Second name", { maxLength: 40, autoComplete: "off" })}
        </div>
        <div className={pair}>
          {text("date", "Wedding date", { type: "date" })}
          {text("city", "City", { maxLength: 60, placeholder: "Accra, Ghana" })}
        </div>
      </Group>

      <Group id="events-title" title="Events">
        {EVENTS.map((e) => (
          <fieldset key={e.id} className="m-0 flex flex-col gap-5 border border-line p-4 sm:p-5">
            <legend className="px-1 font-display text-[24px] italic">{e.name}</legend>
            <div className={pair}>
              {text(`${e.id}_date`, "Date", { type: "date" })}
              {text(`${e.id}_time`, "Time", { maxLength: 20, placeholder: "e.g. 10:00 AM", hint: "Leave blank to show “Time TBC”." })}
            </div>
            {text(`${e.id}_venue`, "Venue", { maxLength: 120 })}
            {text(`${e.id}_mapUrl`, "Map link (optional)", {
              type: "url",
              inputMode: "url",
              maxLength: 500,
              placeholder: "https://maps.app.goo.gl/…",
              hint: "Leave blank to search Google Maps for the venue.",
            })}
            <div className="flex flex-col gap-3">
              <p className="type-label m-0 text-ink-2">Dress colours (up to {MAX_COLOURS})</p>
              {Array.from({ length: MAX_COLOURS }, (_, i) => {
                const name = `${e.id}_colour${i}_name`;
                const hex = `${e.id}_colour${i}_hex`;
                return (
                  <div key={i} className="flex items-end gap-3">
                    <TextField
                      id={name}
                      name={name}
                      label={`Colour ${i + 1} name`}
                      placeholder={i === 0 ? "e.g. Champagne" : undefined}
                      maxLength={30}
                      defaultValue={v[name]}
                      error={errors[hex]}
                      className="flex-1"
                    />
                    <label className="flex flex-col gap-1.5">
                      <span className="sr-only">Colour {i + 1} swatch</span>
                      <input
                        type="color"
                        name={hex}
                        defaultValue={v[hex]}
                        className="h-[52px] w-16 cursor-pointer rounded-input border border-border bg-field p-1"
                      />
                    </label>
                  </div>
                );
              })}
              <p className="m-0 text-[14px] text-ink-2">Clear a name to remove that colour.</p>
            </div>
          </fieldset>
        ))}
      </Group>

      <Group id="replies-title" title="Replies and contact">
        {text("rsvpDeadline", "Last day to reply", { type: "date", hint: "Replies close at the end of this day (Accra time)." })}
        <div className={pair}>
          {text("contactName", "Contact name", { maxLength: 40, placeholder: "e.g. Auntie Efua" })}
          {text("contactPhone", "Contact phone (optional)", { type: "tel", inputMode: "tel", maxLength: 20, placeholder: "024 123 4567" })}
        </div>
      </Group>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save details"}
        </Button>
      </div>
    </form>
  );
}
