"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Badge, Button, ChoiceCard, ErrorSummary, FieldError, Notice, TextArea, TextField } from "@/components/ui";
import type { EventId } from "@/lib/content/wedding";
import type { EventResponse } from "@/lib/data/types";
import { fieldId, NOTE_MAX, summaryTitle, type RsvpEvent, type RsvpState } from "@/lib/rsvp";

type Props = {
  events: RsvpEvent[];
  initial: Partial<Record<EventId, EventResponse>> | null;
  initialNote: string | null;
  action: (prev: RsvpState, form: FormData) => Promise<RsvpState>;
  submitLabel: string;
};

type Draft = { answer: "yes" | "no" | ""; names: string[] };

function draftsFrom(events: RsvpEvent[], initial: Props["initial"]): Record<string, Draft> {
  return Object.fromEntries(
    events.map((e) => {
      const r = initial?.[e.id];
      return [e.id, { answer: r ? (r.attending ? "yes" : "no") : "", names: r?.names.length ? r.names : [""] }];
    }),
  );
}

export function RsvpForm({ events, initial, initialNote, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [drafts, setDrafts] = useState(() => draftsFrom(events, initial));
  const [note, setNote] = useState(initialNote ?? "");
  const summaryRef = useRef<HTMLDivElement>(null);

  // After a failed submit, restore exactly what the guest sent (adjusting state
  // during render, so there is no extra paint with stale values)...
  const [shown, setShown] = useState(state);
  if (state !== shown) {
    setShown(state);
    if (state.status !== "idle") {
      setDrafts(
        Object.fromEntries(
          events.map((e) => {
            const names = state.values.names[e.id] ?? [];
            return [e.id, { answer: state.values.answers[e.id] ?? "", names: names.length ? names : [""] }];
          }),
        ),
      );
      setNote(state.values.note);
    }
  }
  // ...and move focus to the summary so screen readers announce it.
  useEffect(() => {
    if (state.status !== "idle") summaryRef.current?.focus();
  }, [state]);

  const errors = state.status === "invalid" ? state.errors.fields : {};
  const update = (id: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  return (
    <form
      action={formAction}
      // With JS, submit manually so React doesn't reset the form after an
      // error; without JS, the native action above still works.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex flex-col gap-[26px]"
    >
      <div ref={summaryRef} tabIndex={-1} className="flex flex-col gap-4 outline-none empty:hidden">
        {state.status === "invalid" && (
          <ErrorSummary title={summaryTitle(state.errors.summary.length)} errors={state.errors.summary} />
        )}
        {state.status === "failed" && <Notice tone="error">{state.message}</Notice>}
      </div>

      {events.map((event, index) => {
        const draft = drafts[event.id];
        const eventError = errors[fieldId.event(event.id)];
        // The first earlier event with names, offered as "Same names as …".
        const source = events
          .slice(0, index)
          .find((e) => drafts[e.id].answer === "yes" && drafts[e.id].names.some(Boolean));
        const seatsLeft = event.seats - draft.names.length;

        return (
          <fieldset
            key={event.id}
            id={fieldId.event(event.id)}
            aria-describedby={eventError ? `${fieldId.event(event.id)}-error` : undefined}
            className="group m-0 flex flex-col gap-2.5 border-0 p-0"
          >
            <legend className="type-legend mb-1 flex items-center gap-2 p-0">
              {event.name}
              {event.seats > 1 && <Badge tone="seats">Admits {event.seats}</Badge>}
            </legend>

            <ChoiceCard
              name={`attending_${event.id}`}
              value="yes"
              checked={draft.answer === "yes"}
              onChange={() => update(event.id, { answer: "yes" })}
              invalid={!!eventError}
            >
              Joyfully attending
            </ChoiceCard>
            <ChoiceCard
              name={`attending_${event.id}`}
              value="no"
              checked={draft.answer === "no"}
              onChange={() => update(event.id, { answer: "no" })}
              invalid={!!eventError}
            >
              Can&apos;t make it
            </ChoiceCard>
            {eventError && <FieldError id={`${fieldId.event(event.id)}-error`}>{eventError}</FieldError>}

            {/* Shown by CSS when "attending" is checked, so it also works before JS loads. */}
            <div className="hidden flex-col gap-3.5 bg-paper p-4 group-has-[[value=yes]:checked]:flex">
                {source && (
                  <button
                    type="button"
                    onClick={() => update(event.id, { names: drafts[source.id].names.filter(Boolean).slice(0, event.seats) })}
                    className="min-h-11 self-start border-0 bg-transparent p-0 text-left text-[16px] text-accent underline underline-offset-[3px]"
                  >
                    Same names as {source.name}
                  </button>
                )}

                {draft.names.map((name, i) => (
                  <TextField
                    key={i}
                    id={fieldId.seat(event.id, i)}
                    name={`names_${event.id}`}
                    label={`Guest ${i + 1}`}
                    placeholder="Full name"
                    autoComplete={i === 0 ? "name" : "off"}
                    maxLength={80}
                    value={name}
                    onChange={(e) => {
                      const names = [...draft.names];
                      names[i] = e.target.value;
                      update(event.id, { names });
                    }}
                    error={errors[fieldId.seat(event.id, i)]}
                    action={
                      draft.names.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => update(event.id, { names: draft.names.filter((_, j) => j !== i) })}
                          aria-label={`Remove guest ${i + 1} from ${event.name}`}
                          className="min-h-8 border-0 bg-transparent p-0 text-[16px] text-accent underline underline-offset-[3px]"
                        >
                          Remove
                        </button>
                      ) : undefined
                    }
                  />
                ))}

                {seatsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => update(event.id, { names: [...draft.names, ""] })}
                    className="min-h-11 self-start border-0 bg-transparent p-0 text-left text-[16px] text-accent underline underline-offset-[3px]"
                  >
                    + Add a guest ({seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left)
                  </button>
                )}
            </div>
          </fieldset>
        );
      })}

      <TextArea
        id={fieldId.note}
        name="note"
        label="A note for the couple"
        placeholder="Optional"
        maxLength={NOTE_MAX}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button type="submit" fullWidth disabled={pending} aria-disabled={pending}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
