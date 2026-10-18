import type { ReactNode } from "react";
import { CoupleNames } from "@/components/ui";
import { getWedding } from "@/lib/data";
import { ContactLine } from "./ContactLine";
import { GuestPage } from "./GuestPage";
import { HeroPhoto } from "./HeroPhoto";
import { Roses } from "./Roses";

/** Shared frame for the public "request a place" and "sign up" pages. */
export function SignupShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <GuestPage>
      <HeroPhoto eyebrow={eyebrow} height="short" stacked={false} names="lg" />
      <section className="flex flex-col gap-[26px] bg-panel px-7 pt-12 pb-14">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="type-title m-0">{title}</h2>
          {lead && <p className="type-meta m-0">{lead}</p>}
        </div>
        {children}
      </section>
      <footer className="flex flex-col items-center gap-4 px-7 py-12 text-center">
        <Roses size="sm" />
        <ContactLine className="text-ink-2" />
      </footer>
    </GuestPage>
  );
}

/** The link is off, replaced, full or mistyped. */
export async function SignupClosed({ title, children }: { title: string; children: ReactNode }) {
  const { partners } = await getWedding();
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col items-center justify-center gap-[22px] overflow-hidden px-9 text-center">
      <CoupleNames partners={partners} size="md" as="p" className="text-[56px] text-accent" />
      <h1 className="type-title m-0 text-[30px] leading-tight">{title}</h1>
      <p className="m-0 text-[16px] text-ink-2">{children}</p>
      <ContactLine lead="Need help?" className="mt-2 text-[15px] text-ink-2" />
      <Roses size="lg" className="pointer-events-none absolute -right-5 -bottom-5" />
    </main>
  );
}
