import { getWedding } from "@/lib/data";
import { countdownFor } from "@/lib/wedding";
import { Countdown } from "./Countdown";

/** The live countdown to the day's start time, with server-side starting values. */
export async function WeddingCountdown({ className }: { className?: string }) {
  const { events } = await getWedding();
  return <Countdown {...countdownFor(events[0])} className={className} />;
}
