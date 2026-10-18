"use client";

import { useActionState, useState } from "react";
import { addTeamMember, resetTeamPassword, type TeamFormState } from "@/app/(organiser)/admin/team/actions";
import { Button, Icon, Notice, TextField } from "@/components/ui";

/** New sign-in details, shown once: copy them or send them on WhatsApp. */
function Credentials({ email, password, loginUrl, coupleNames, title }: { email: string; password: string; loginUrl: string; coupleNames: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const message = `You're on the team for ${coupleNames}'s wedding.\n\nSign in here: ${loginUrl}\nEmail: ${email}\nPassword: ${password}`;
  return (
    <div role="status" className="flex flex-col gap-3 border border-success bg-success-tint p-4">
      <p className="m-0 flex items-center gap-2 font-semibold text-success">
        <Icon name="check" />
        {title}
      </p>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[16px]">
        <dt className="text-ink-2">Email</dt>
        <dd className="m-0 break-all">{email}</dd>
        <dt className="text-ink-2">Password</dt>
        <dd className="m-0 font-semibold tracking-wide">{password}</dd>
      </dl>
      <p className="m-0 text-[14px] text-ink-2">Send this now: it won&apos;t be shown again. You can always reset it.</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="whatsapp" href={`https://wa.me/?text=${encodeURIComponent(message)}`} external>
          Send on WhatsApp
        </Button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard blocked; the details are on screen */
            }
          }}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink bg-transparent px-4 text-[15px] text-ink hover:bg-panel"
        >
          <Icon name={copied ? "check" : "copy"} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function AddMemberForm({ loginUrl, coupleNames }: { loginUrl: string; coupleNames: string }) {
  const [state, action, pending] = useActionState<TeamFormState, FormData>(addTeamMember, { status: "idle" });
  return (
    <div className="flex flex-col gap-4">
      {state.status === "created" && (
        <Credentials
          email={state.email}
          password={state.password}
          loginUrl={loginUrl}
          coupleNames={coupleNames}
          title={`${state.role === "usher" ? "Usher" : "Organiser"} added`}
        />
      )}
      <form action={action} className="flex flex-col gap-4" key={state.status === "created" ? state.email : "add"}>
        <TextField
          id="new-email"
          name="email"
          type="email"
          label="Their email"
          autoComplete="off"
          inputMode="email"
          placeholder="usher@example.com"
          defaultValue={state.status === "invalid" ? state.email : ""}
          error={state.status === "invalid" ? state.message : undefined}
        />
        <fieldset className="m-0 border-0 p-0">
          <legend className="type-label mb-2 p-0 text-ink-2">They can</legend>
          <div className="flex flex-col gap-2">
            {[
              { value: "usher", label: "Check guests in", hint: "Usher: only the Check-in screen." },
              { value: "organiser", label: "Manage everything", hint: "Organiser: the whole dashboard, including this page." },
            ].map((r) => (
              <label
                key={r.value}
                className="flex min-h-14 cursor-pointer items-start gap-3 border border-border bg-field p-3 has-[:checked]:border-2 has-[:checked]:border-accent has-[:checked]:p-[11px]"
              >
                <input type="radio" name="role" value={r.value} defaultChecked={r.value === "usher"} className="mt-1 size-4 accent-accent" />
                <span>
                  <span className="block text-[16px]">{r.label}</span>
                  <span className="block text-[14px] text-ink-2">{r.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add to team"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ResetPasswordButton({ id, loginUrl, coupleNames }: { id: string; loginUrl: string; coupleNames: string }) {
  const [state, action, pending] = useActionState<TeamFormState>(resetTeamPassword.bind(null, id), { status: "idle" });
  return (
    <div className="flex flex-col gap-3">
      {state.status === "reset" ? (
        <Credentials email={state.email} password={state.password} loginUrl={loginUrl} coupleNames={coupleNames} title="New password set" />
      ) : (
        <form action={action}>
          <button
            type="submit"
            disabled={pending}
            className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[15px] text-accent underline underline-offset-[3px]"
          >
            {pending ? "Making a new password…" : "Reset password"}
          </button>
        </form>
      )}
      {state.status === "invalid" && <Notice tone="error">{state.message}</Notice>}
    </div>
  );
}
