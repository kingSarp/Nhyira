import QRCode from "qrcode";
import { Badge } from "@/components/ui";
import { clockTime } from "@/lib/checkin";
import { getWedding, peopleFor, type Invitation } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { displayTime } from "@/lib/wedding";

/**
 * The entrance pass: a QR code of the guest's own invitation link. The
 * check-in screen reads the token from it; a phone camera just opens the
 * invitation. Black on white whatever the theme, so every scanner reads it.
 */
export async function GuestPass({ invitation, className }: { invitation: Invitation; className?: string }) {
  const [w, svg] = await Promise.all([
    getWedding(),
    QRCode.toString(`${siteUrl()}/i/${invitation.token}`, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }),
  ]);
  const day = w.events[0];
  const name = invitation.greeting ?? invitation.householdName;

  return (
    <section aria-labelledby="pass-title" className={className}>
      <div className="flex flex-col items-center gap-4 border border-line bg-field px-6 py-8 text-center">
        <h2 id="pass-title" className="type-eyebrow m-0 font-normal">
          Your pass
        </h2>
        <div
          role="img"
          aria-label={`QR code for ${name}'s pass`}
          className="w-[220px] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
          // Trusted: SVG generated on our server from our own URL.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="flex flex-col items-center gap-2">
          <p className="m-0 font-display text-[30px] leading-tight">{name}</p>
          <Badge tone="seats">Admits {peopleFor(invitation)}</Badge>
        </div>
        <p className="type-meta m-0">
          {shortDate(day.date)} · {displayTime(day.time)}
          <br />
          {day.venue}
        </p>
        {invitation.checkedInAt ? (
          <p className="m-0 text-[15px] text-success">Checked in at {clockTime(invitation.checkedInAt)}</p>
        ) : (
          <p className="m-0 max-w-[300px] text-[15px] text-ink-2">
            Show this at the entrance. Take a screenshot so you have it even without data.
          </p>
        )}
      </div>
    </section>
  );
}
