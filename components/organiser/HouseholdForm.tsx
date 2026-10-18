"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { Button, ErrorSummary, FieldError, Notice, TextField } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { MAX_SEATS, SIDES, type HouseholdFields, type HouseholdFormState } from "@/lib/household-forms";
import { summaryTitle } from "@/lib/rsvp";

type Props = {
  initial?: HouseholdFields;
  action: (prev: HouseholdFormState, form: FormData) => Promise<HouseholdFormState>;
  submitLabel: string;
};

export function HouseholdForm({ initial, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle") top.current?.focus();
  }, [state]);

  const v = state.status === "idle" ? initial : state.values;
  const errors = state.status === "invalid" ? state.errors.fields : {};
  const seatError = wedding.events.map((e) => errors[`seats-${e.id}`]).find(Boolean);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex max-w-[560px] flex-col gap-5"
    >
      <div ref={top} tabIndex={-1} className="outline-none empty:hidden">
        {state.status === "invalid" && <ErrorSummary title={summaryTitle(state.errors.summary.length)} errors={state.errors.summary} />}
        {state.status === "failed" && <Notice tone="error">{state.message}</Notice>}
      </div>

      <TextField id="householdName" name="householdName" label="Household name" placeholder="e.g. Kwame & Ama Boateng" maxLength={80} defaultValue={v?.householdName} error={errors.householdName} />
      <TextField
        id="greeting"
        name="greeting"
        label="Greet them as (optional)"
        placeholder="e.g. Kwame & Ama"
        maxLength={60}
        defaultValue={v?.greeting}
        hint="Shown on their invite and WhatsApp message. Leave blank to use the household name."
      />
      <TextField id="phone" name="phone" type="tel" inputMode="tel" label="WhatsApp number" placeholder="024 123 4567" maxLength={20} defaultValue={v?.phone} error={errors.phone} hint="Needed to send the invite on WhatsApp." />
      <TextField id="side" name="side" label="Family side (optional)" list="sides" maxLength={60} defaultValue={v?.side} />
      <datalist id="sides">
        {SIDES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <fieldset id={`seats-${wedding.events[0].id}`} className="m-0 border-0 p-0" aria-describedby={seatError ? "seats-error" : undefined}>
        <legend className="type-label mb-1 p-0 text-ink-2">{wedding.events.length === 1 ? "Seats" : "Seats per event"}</legend>
        <p className="m-0 mb-3 text-[14px] text-ink-2">
          {wedding.events.length === 1 ? "How many people this invite admits, including them." : "How many people this invite admits. 0 or blank = not invited to that event."}
        </p>
        <div className="flex flex-wrap gap-4">
          {wedding.events.map((e) => (
            <label key={e.id} id={e.id === wedding.events[0].id ? undefined : `seats-${e.id}`} className="flex flex-col gap-1.5 text-[15px]">
              {e.name.replace(/^The /, "")}
              <input
                type="number"
                name={`seats_${e.id}`}
                min={0}
                max={MAX_SEATS}
                inputMode="numeric"
                defaultValue={v?.seats[e.id] ?? ""}
                aria-invalid={errors[`seats-${e.id}`] ? true : undefined}
                className="h-[52px] w-24 rounded-input border border-border bg-field px-3 text-[17px] text-ink focus:border-2 focus:border-accent focus:px-[11px] focus:outline-none aria-[invalid=true]:border-2 aria-[invalid=true]:border-error"
              />
            </label>
          ))}
        </div>
        {seatError && (
          <div className="mt-2">
            <FieldError id="seats-error">{seatError}</FieldError>
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href="/admin" className="flex min-h-11 items-center">
          Cancel
        </Link>
      </div>
    </form>
  );
}
