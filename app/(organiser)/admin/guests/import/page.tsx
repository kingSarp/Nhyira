import type { Metadata } from "next";
import Link from "next/link";
import { ImportForm } from "@/components/organiser/ImportForm";
import { importStep } from "../actions";

export const metadata: Metadata = { title: "Import guests" };

export default function ImportPage() {
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin" className="flex min-h-11 items-center self-start text-[15px]">
          ← Guests
        </Link>
        <h1 className="type-org-title m-0">Import guests</h1>
        <p className="m-0 max-w-[680px] text-ink-2">
          Add your whole list at once. You&apos;ll see a check of every row before anything is added, and rows with a problem are
          skipped, never half-added.
        </p>
      </div>
      <ImportForm action={importStep} />
    </main>
  );
}
