"use client";

import { useActionState } from "react";
import { requestSignInLink, type SignInState } from "@/app/(organiser)/login/actions";
import { Button, TextField } from "@/components/ui";

export function SignInForm({ email = "", submitLabel }: { email?: string; submitLabel: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestSignInLink, { email });

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        defaultValue={state.email ?? email}
        error={state.error}
        required
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
