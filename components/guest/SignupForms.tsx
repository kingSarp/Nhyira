"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { Button, ChoiceCard, ErrorSummary, FieldError, Notice, SelectField, TextArea, TextField } from "@/components/ui";
import type { EventId } from "@/lib/content/wedding";
import { MAX_PARTY, type SignupState } from "@/lib/signup-forms";
import { summaryTitle } from "@/lib/rsvp";

type Action = (prev: SignupState, form: FormData) => Promise<SignupState>;

/** Submit by hand so React doesn't reset the fields after an error. */
function useSignupForm(action: Action) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle") summaryRef.current?.focus();
  }, [state]);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };
  const values = state.status === "idle" ? {} : state.values;
  const errors = state.status === "invalid" ? state.errors.fields : {};
  const top = (
    <div ref={summaryRef} tabIndex={-1} className="outline-none empty:hidden">
      {state.status === "invalid" && <ErrorSummary title={summaryTitle(state.errors.summary.length)} errors={state.errors.summary} />}
      {state.status === "failed" && <Notice tone="error">{state.message}</Notice>}
    </div>
  );
  return { formAction, onSubmit, pending, values, errors, top };
}

function PersonFields({ values, errors, phoneHint }: { values: Record<string, string>; errors: Record<string, string>; phoneHint: string }) {
  return (
    <>
      <TextField id="name" name="name" label="Full name" autoComplete="name" maxLength={80} defaultValue={values.name} error={errors.name} />
      <TextField
        id="phone"
        name="phone"
        type="tel"
        label="WhatsApp number"
        autoComplete="tel"
        inputMode="tel"
        placeholder="024 123 4567"
        maxLength={20}
        defaultValue={values.phone}
        error={errors.phone}
        hint={phoneHint}
      />
    </>
  );
}

export function RequestForm({ action }: { action: Action }) {
  const { formAction, onSubmit, pending, values, errors, top } = useSignupForm(action);
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-[22px]">
      {top}
      <PersonFields values={values} errors={errors} phoneHint="The couple will use this to send your invitation." />
      <SelectField id="partySize" name="partySize" label="How many people, including you" defaultValue={values.partySize ?? "1"} error={errors.partySize}>
        {Array.from({ length: MAX_PARTY }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1} {i === 0 ? "person" : "people"}
          </option>
        ))}
      </SelectField>
      <TextField id="side" name="side" label="How do you know the couple? (optional)" placeholder="e.g. Work colleague" maxLength={80} defaultValue={values.side} />
      <TextArea id="message" name="message" label="A message for the couple (optional)" maxLength={500} defaultValue={values.message} />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Sending…" : "Send my request"}
      </Button>
    </form>
  );
}

export function OpenSignupForm({ action, events }: { action: Action; events: { id: EventId; name: string; when: string }[] }) {
  const { formAction, onSubmit, pending, values, errors, top } = useSignupForm(action);
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-[22px]">
      {top}
      <PersonFields values={values} errors={errors} phoneHint="One sign-up per number. We'll only use it if plans change." />
      {events.length > 1 && events.map((e) => {
        const err = errors[`event-${e.id}`];
        return (
          <fieldset
            key={e.id}
            id={`event-${e.id}`}
            aria-describedby={err ? `event-${e.id}-error` : undefined}
            className="m-0 flex flex-col gap-2.5 border-0 p-0"
          >
            <legend className="type-legend mb-1 p-0">
              {e.name}
              <span className="mt-0.5 block font-serif text-[15px] font-normal text-ink-2">{e.when}</span>
            </legend>
            <ChoiceCard name={`attending_${e.id}`} value="yes" defaultChecked={values[`attending_${e.id}`] === "yes"} invalid={!!err}>
              I&apos;ll be there
            </ChoiceCard>
            <ChoiceCard name={`attending_${e.id}`} value="no" defaultChecked={values[`attending_${e.id}`] === "no"} invalid={!!err}>
              Can&apos;t make it
            </ChoiceCard>
            {err && <FieldError id={`event-${e.id}-error`}>{err}</FieldError>}
          </fieldset>
        );
      })}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Confirming…" : "Confirm my place"}
      </Button>
    </form>
  );
}
