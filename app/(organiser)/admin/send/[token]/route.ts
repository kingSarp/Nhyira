import { NextResponse, type NextRequest } from "next/server";
import { getInvitation, getOrganiser, markSent } from "@/lib/data";
import { whatsappUrl } from "@/lib/households";

/**
 * /admin/send/<token>?kind=invite|reminder
 * Records that the invite was sent, then opens WhatsApp with the message ready.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/send/[token]">) {
  if (!(await getOrganiser())) return NextResponse.redirect(new URL("/login", request.url));
  const { token } = await ctx.params;
  const kind = request.nextUrl.searchParams.get("kind") === "reminder" ? "reminder" : "invite";
  const inv = await getInvitation(token);
  const url = inv ? whatsappUrl(inv, kind) : null;
  if (!inv || !url) return NextResponse.redirect(new URL(`/admin/guests/${token}`, request.url));
  await markSent(token);
  return NextResponse.redirect(url);
}
