"use server";

import { redirect } from "next/navigation";
import { openLinkEvents, registerOpenSignup, resolveSignupLink } from "@/lib/data";
import { duplicateMessage, parseOpenSignup, type SignupState } from "@/lib/signup-forms";

export async function submitOpenSignup(code: string, _prev: SignupState, form: FormData): Promise<SignupState> {
  const { link } = await resolveSignupLink("open", code);
  const { values, errors, attending } = parseOpenSignup(form, await openLinkEvents(link));
  if (errors) return { status: "invalid", values, errors };

  const result = await registerOpenSignup(code, { name: values.name, phone: values.phone, attending });
  if (!result.ok) {
    if (result.reason === "duplicate") return { status: "failed", values, message: duplicateMessage };
    redirect(`/join/${code}`); // switched off or full meanwhile
  }
  // Their own personal invitation, on the thank-you state.
  redirect(`/i/${result.value.token}?sent=1&new=1`);
}
