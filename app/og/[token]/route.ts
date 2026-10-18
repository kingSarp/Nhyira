import { wedding } from "@/lib/content/wedding";
import { getInvitation } from "@/lib/data";
import { inviteCard } from "@/lib/og";

// The card WhatsApp shows before a guest taps their personal link.
export async function GET(_request: Request, ctx: RouteContext<"/og/[token]">) {
  const { token } = await ctx.params;
  const inv = await getInvitation(token);
  return inviteCard({ who: inv?.householdName, withPhoto: wedding.previewWithPhoto });
}
