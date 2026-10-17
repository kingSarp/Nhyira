"use server";

import { redirect } from "next/navigation";
import { createJoinRequest } from "@/lib/data";
import { duplicateMessage, parseRequest, type SignupState } from "@/lib/signup-forms";

export async function submitRequest(code: string, _prev: SignupState, form: FormData): Promise<SignupState> {
  const { values, errors, partySize } = parseRequest(form);
  if (errors) return { status: "invalid", values, errors };

  const result = await createJoinRequest(code, {
    name: values.name,
    phone: values.phone,
    partySize,
    side: values.side || null,
    message: values.message || null,
  });
  if (!result.ok) {
    if (result.reason === "duplicate") return { status: "failed", values, message: duplicateMessage };
    redirect(`/request/${code}`); // the link was switched off meanwhile
  }
  redirect(`/request/${code}?sent=1&name=${encodeURIComponent(values.name.split(/\s+/)[0])}`);
}
