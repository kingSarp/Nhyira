import type { Metadata } from "next";
import { ScreenStub } from "@/components/dev/ScreenStub";
import { getHeadcount, listHouseholds } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminPage() {
  const [households, headcount] = await Promise.all([listHouseholds(), getHeadcount()]);
  const replied = households.filter((h) => h.status !== "waiting").length;

  return (
    <ScreenStub
      title="Dashboard"
      boards={["5a · Dashboard, mobile", "5a · Dashboard, desktop", "5b · Search, no matches"]}
      states={["Mixed replies", "Search with no matches", "Household with no phone"]}
      data={{
        households: households.length,
        replied,
        ...Object.fromEntries(headcount.map((h) => [h.eventName, `${h.confirmed} of ${h.invited} seats`])),
      }}
    />
  );
}
