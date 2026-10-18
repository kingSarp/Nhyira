"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  setNewPassword,
  signIn,
  type PasswordState,
  type SignInState,
} from "@/app/(organiser)/login/actions";
import { Button, TextField } from "@/components/ui";
import { MIN_PASSWORD } from "@/lib/password";

function EmailField({ email, error }: { email: string; error?: string }) {
  return (
    <TextField
      id="email"
      name="email"
      type="email"
      label="Email"
      autoComplete="username"
      inputMode="email"
      placeholder="you@example.com"
      defaultValue={email}
      error={error}
      required
    />
  );
}

export function SignInForm({ email = "" }: { email?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { email });
  const onPassword = state.field === "password";

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <EmailField email={state.email ?? email} error={onPassword ? undefined : state.error} />
      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        error={onPassword ? state.error : undefined}
        required
        action={
          <Link href="/login?forgot=1" className="flex min-h-11 items-center text-[15px]">
            Forgot password?
          </Link>
        }
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function ResetRequestForm({ email = "", submitLabel }: { email?: string; submitLabel: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestPasswordReset, { email });

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <EmailField email={state.email ?? email} error={state.error} />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(setNewPassword, {});

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD}
        hint={`At least ${MIN_PASSWORD} characters.`}
        required
      />
      <TextField
        id="confirm"
        name="confirm"
        type="password"
        label="Type it again"
        autoComplete="new-password"
        error={state.error}
        required
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
