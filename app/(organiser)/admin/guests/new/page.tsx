import type { Metadata } from "next";
import Link from "next/link";
import { HouseholdForm } from "@/components/organiser/HouseholdForm";
import { saveHousehold } from "../actions";

export const metadata: Metadata = { title: "Add a household" };

export default function NewHouseholdPage() {
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin" className="flex min-h-11 items-center self-start text-[15px]">
          ← Guests
        </Link>
        <h1 className="type-org-title m-0">Add a household</h1>
        <p className="m-0 text-ink-2">
          Adding many at once? <Link href="/admin/guests/import">Import a spreadsheet</Link> instead.
        </p>
      </div>
      <HouseholdForm action={saveHousehold.bind(null, null)} submitLabel="Add household" />
    </main>
  );
}
