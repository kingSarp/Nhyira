import { wedding } from "@/lib/content/wedding";
import { Roses } from "./Roses";

/** Roses, the household's name in script, and the couple's line. */
export function Greeting({ name }: { name: string }) {
  return (
    <section aria-label="Your invitation" className="flex flex-col items-center gap-2.5 px-8 pt-12 pb-14 text-center">
      <Roses />
      <p className="type-greeting m-0">{name}</p>
      <p className="m-0 text-ink-2">{wedding.inviteLine}</p>
    </section>
  );
}
