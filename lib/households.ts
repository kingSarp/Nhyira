import { wedding, type EventId } from "@/lib/content/wedding";
import type { Invitation } from "@/lib/data/types";
import { siteUrl } from "@/lib/site";
import { toWhatsAppNumber } from "@/lib/format";

const TITLES = /^(mr|mrs|ms|miss|dr|rev|prof|nana|togbe|hon|pastor)\.?$/i;

/** "Kwame Boateng" → "Kwame"; titled names stay whole ("Rev. Addo"). */
export function shortGuestName(full: string) {
  const [first] = full.trim().split(/\s+/);
  return TITLES.test(first) ? full.trim() : first;
}

/** One line per invited event, as the dashboard shows it. */
export function answerLines(inv: Invitation) {
  return wedding.events
    .filter((e) => (inv.seats[e.id as EventId] ?? 0) > 0)
    .map((e) => {
      const seats = inv.seats[e.id as EventId] ?? 0;
      const r = inv.responses?.[e.id as EventId];
      let text: string;
      if (!inv.respondedAt || !r) text = `${seats} invited`;
      else if (!r.attending) text = "not attending";
      else text = `${r.names.length} of ${seats} (${r.names.map(shortGuestName).join(", ")})`;
      return { id: e.id, label: e.shortName, text };
    });
}

export function inviteUrl(token: string) {
  return `${siteUrl()}/i/${token}`;
}

/** The prefilled WhatsApp message for a household. `reminder` for a gentle nudge. */
export function inviteMessage(inv: Invitation, kind: "invite" | "reminder" = "invite") {
  const name = inv.greeting ?? inv.householdName;
  if (kind === "reminder") {
    return (
      `Dear ${name},\n\n` +
      `A gentle reminder from ${wedding.coupleNames}: we'd love to know if you can join us. ` +
      `It takes a minute to reply here:\n\n` +
      inviteUrl(inv.token)
    );
  }
  return (
    `Dear ${name},\n\n` +
    `${wedding.coupleNames} warmly invite you to celebrate their wedding with them. ` +
    `Please open your personal invitation and let us know if you can come:\n\n` +
    inviteUrl(inv.token)
  );
}

/** wa.me link with the message filled in, or null when there's no usable number. */
export function whatsappUrl(inv: Invitation, kind: "invite" | "reminder" = "invite") {
  const wa = toWhatsAppNumber(inv.phone);
  return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(inviteMessage(inv, kind))}` : null;
}

/** "Church 2 · Reception 2" */
export function seatLine(inv: Invitation) {
  return wedding.events
    .filter((e) => (inv.seats[e.id as EventId] ?? 0) > 0)
    .map((e) => `${e.shortName} ${inv.seats[e.id as EventId]}`)
    .join(" · ");
}

/** "Sent today", "Sent 3 days ago", "Not sent". */
export function sentLabel(sentAt: string | null | undefined, now = new Date()) {
  if (!sentAt) return "Not sent";
  const days = Math.floor((now.getTime() - new Date(sentAt).getTime()) / 864e5);
  if (days <= 0) return "Sent today";
  if (days === 1) return "Sent yesterday";
  return `Sent ${days} days ago`;
}
