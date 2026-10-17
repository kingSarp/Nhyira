import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HouseholdForm } from "@/components/organiser/HouseholdForm";
import { Button } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { getInvitation } from "@/lib/data";
import { deleteHousehold, saveHousehold } from "../actions";

export const metadata: Metadata = { title: "Edit household" };

export default async function EditHouseholdPage({ params, searchParams }: PageProps<"/admin/guests/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const inv = await getInvitation(token);
  if (!inv) notFound();

  const initial = {
    householdName: inv.householdName,
    greeting: inv.greeting ?? "",
    phone: inv.phone ?? "",
    side: inv.side ?? "",
    seats: Object.fromEntries(wedding.events.map((e) => [e.id, inv.seats[e.id] ? String(inv.seats[e.id]) : ""])),
  };

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin" className="flex min-h-11 items-center self-start text-[15px]">
          ← Guests
        </Link>
        <h1 className="type-org-title m-0">Edit household</h1>
        {inv.respondedAt && (
          <p className="m-0 max-w-[560px] text-ink-2">
            They have already replied. Lowering seats keeps the first names they gave; removing an event clears their answer for it.
          </p>
        )}
      </div>

      <HouseholdForm initial={initial} action={saveHousehold.bind(null, token)} submitLabel="Save changes" />

      <section aria-labelledby="remove" className="mt-6 flex max-w-[560px] flex-col gap-3 border-t border-line pt-6">
        <h2 id="remove" className="m-0 text-[18px] font-normal">
          Remove from the guest list
        </h2>
        {sp.confirm === "remove" ? (
          <div role="alert" className="flex flex-col gap-3 border border-error bg-field p-4">
            <p className="m-0">
              Remove <strong className="font-semibold">{inv.householdName}</strong>? Their personal link will stop working and their reply is deleted.
            </p>
            <div className="flex flex-wrap gap-3">
              <form action={deleteHousehold.bind(null, token)}>
                <Button type="submit">Yes, remove</Button>
              </form>
              <Button href={`/admin/guests/${token}`} variant="secondary">
                Keep them
              </Button>
            </div>
          </div>
        ) : (
          <Link href={`/admin/guests/${token}?confirm=remove#remove`} className="flex min-h-11 items-center self-start text-error">
            Remove this household
          </Link>
        )}
      </section>
    </main>
  );
}
