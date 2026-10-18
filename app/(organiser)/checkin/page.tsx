import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckInDesk } from "@/components/organiser/CheckInDesk";
import { arrivalCounts, getStaff, getWedding } from "@/lib/data";
import { signOut } from "../login/actions";

export const metadata: Metadata = { title: "Check-in" };

/** The entrance: organisers and ushers scan passes or find guests by name. */
export default async function CheckInPage() {
  const staff = await getStaff();
  if (!staff) redirect("/login");
  const [{ coupleNames }, counts] = await Promise.all([getWedding(), arrivalCounts()]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-6 pb-12 lg:px-6 lg:pt-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4 text-[14px] text-ink-2">
          {staff.role === "organiser" ? (
            <Link href="/admin" className="flex min-h-11 items-center">
              ← Dashboard
            </Link>
          ) : (
            <span>{staff.email}</span>
          )}
          <form action={signOut}>
            <button type="submit" className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-accent underline underline-offset-[3px]">
              Sign out
            </button>
          </form>
        </div>
        <p className="m-0 font-script text-[40px] leading-tight">{coupleNames}</p>
        <h1 className="type-org-title m-0">Check-in</h1>
      </header>

      <p className="m-0 text-[18px]" aria-live="polite">
        <span className="text-[32px] tabular-nums">{counts.arrived}</span>
        <span className="text-ink-2">
          {" "}
          of {counts.expected} {counts.expected === 1 ? "guest" : "guests"} arrived
        </span>
      </p>

      <CheckInDesk />
    </div>
  );
}
