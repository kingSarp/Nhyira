import { getInvitation } from "@/lib/data";
import { inviteCard, ogSize } from "@/lib/og";
import { wedding } from "@/lib/content/wedding";

// The card WhatsApp shows before the guest taps their personal link.
export const alt = "Your wedding invitation";
export const size = ogSize;
export const contentType = "image/jpeg";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInvitation(token);
  return inviteCard({ who: inv?.householdName, withPhoto: wedding.previewWithPhoto });
}
