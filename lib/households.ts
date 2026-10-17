import { wedding, type EventId } from "@/lib/content/wedding";
import type { Invitation } from "@/lib/data/types";
import { siteUrl } from "@/lib/site";

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

/** The prefilled WhatsApp message for a household. */
export function inviteMessage(inv: Invitation) {
  const name = inv.greeting ?? inv.householdName;
  return (
    `Dear ${name},\n\n` +
    `${wedding.coupleNames} warmly invite you to celebrate their wedding with them. ` +
    `Please open your personal invitation and let us know if you can come:\n\n` +
    inviteUrl(inv.token)
  );
}
