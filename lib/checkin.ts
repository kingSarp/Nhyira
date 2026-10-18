// Shared by the check-in screen (client) and its server actions.

/** What the entrance screen shows after a scan or a tap. */
export type CheckedIn = { token: string; name: string; people: number; at: string; by: string | null; declined: boolean };
export type CheckInView =
  | ({ status: "checked-in" } & CheckedIn)
  | ({ status: "already" } & CheckedIn)
  | { status: "unknown" }
  | { status: "invalid" };

export type GuestHit = { token: string; name: string; phoneEnd: string | null; people: number; checkedInAt: string | null; declined: boolean };

/**
 * The invitation token from a scanned QR code. Passes encode the guest's
 * invitation URL (…/i/<token>), so a phone camera opens their invite and the
 * entrance scanner checks them in. A bare token works too.
 */
export function tokenFromScan(raw: string): string | null {
  const text = raw.trim();
  const fromUrl = text.match(/\/i\/([a-z0-9-]{8,80})(?:[/?#]|$)/i);
  if (fromUrl) return fromUrl[1].toLowerCase();
  return /^[a-z0-9-]{8,80}$/i.test(text) ? text.toLowerCase() : null;
}

/** "2:14 pm", Accra time. */
export function clockTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Accra" }).format(new Date(iso));
}
