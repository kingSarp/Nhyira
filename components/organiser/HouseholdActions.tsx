import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Household } from "@/lib/data/types";
import { toWhatsAppNumber } from "@/lib/format";
import { inviteMessage } from "@/lib/households";

export function HouseholdActions({ household, inline }: { household: Household; inline?: boolean }) {
  const wa = toWhatsAppNumber(household.phone);
  return (
    <div className={cn("flex items-center gap-4", inline ? "flex-col items-end gap-1 whitespace-nowrap" : "flex-wrap")}>
      {wa ? (
        <Button variant="whatsapp" href={`https://wa.me/${wa}?text=${encodeURIComponent(inviteMessage(household))}`} external>
          Send on WhatsApp<span className="sr-only"> to {household.householdName}</span>
        </Button>
      ) : (
        <Button variant="whatsapp" disabled>
          Add a phone number to send
        </Button>
      )}
      <Link href={`/i/${household.token}`} target="_blank" className="flex min-h-11 items-center text-[15px]">
        View invite<span className="sr-only"> for {household.householdName} (opens in a new tab)</span>
      </Link>
    </div>
  );
}
