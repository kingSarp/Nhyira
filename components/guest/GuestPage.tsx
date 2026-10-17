import type { ReactNode } from "react";

/**
 * The guest column. Phones get the full width; larger screens get a centred
 * invitation-width column so photos and line lengths stay as designed.
 */
export function GuestPage({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-[520px] overflow-x-clip bg-paper">{children}</main>;
}
