import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Household } from "@/lib/data/types";
import { toWhatsAppNumber } from "@/lib/format";

/** Send on WhatsApp (recorded as sent) + View invite. Used in notices and the send queue. */
export function HouseholdActions({ household, kind = "invite", inline }: { household: Household; kind?: "invite" | "reminder"; inline?: boolean }) {
  const wa = toWhatsAppNumber(household.phone);
  return (
    <div className={cn("flex items-center gap-4", inline ? "flex-col items-end gap-1 whitespace-nowrap" : "flex-wrap")}>
      {wa ? (
        <Button variant="whatsapp" href={`/admin/send/${household.token}?kind=${kind}`} external>
          {kind === "reminder" ? "Send reminder" : "Send on WhatsApp"}
          <span className="sr-only"> to {household.householdName}</span>
        </Button>
      ) : (
        <Button variant="whatsapp" href={`/admin/guests/${household.token}`}>
          Add a phone number to send
        </Button>
      )}
      <Link href={`/i/${household.token}`} target="_blank" className="flex min-h-11 items-center text-[15px]">
        View invite<span className="sr-only"> for {household.householdName} (opens in a new tab)</span>
      </Link>
    </div>
  );
}
