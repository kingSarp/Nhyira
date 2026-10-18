import type { Metadata } from "next";
import { SignupClosed, SignupShell } from "@/components/guest/SignupShell";
import { RequestForm } from "@/components/guest/SignupForms";
import { Notice } from "@/components/ui";
import { getWedding, resolveSignupLink } from "@/lib/data";
import { submitRequest } from "./actions";

export const metadata: Metadata = { title: "Request a place", robots: { index: false, follow: false } };

export default async function RequestPage({ params, searchParams }: PageProps<"/request/[code]">) {
  const { code } = await params;
  const sp = await searchParams;
  const [{ state }, { coupleNames }] = await Promise.all([resolveSignupLink("request", code), getWedding()]);

  if (sp.sent === "1") {
    const name = typeof sp.name === "string" ? sp.name : "";
    return (
      <SignupShell eyebrow="Request a place" title="Request sent">
        <Notice tone="success" icon="check" title={name ? `Thank you, ${name}.` : "Thank you."}>
          {coupleNames} will look at your request and message you on WhatsApp. If they can welcome you,
          you&apos;ll get your own invitation link.
        </Notice>
      </SignupShell>
    );
  }

  if (state !== "active") {
    return (
      <SignupClosed title="This link is no longer taking requests">
        If you were invited, please use the personal link from your WhatsApp message.
      </SignupClosed>
    );
  }

  return (
    <SignupShell
      eyebrow="Request a place"
      title="Would you like to join us?"
      lead={`Tell us who you are. ${coupleNames} will confirm on WhatsApp.`}
    >
      <RequestForm action={submitRequest.bind(null, code)} />
    </SignupShell>
  );
}
