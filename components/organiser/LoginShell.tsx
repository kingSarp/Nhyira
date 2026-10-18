import type { ReactNode } from "react";
import { wedding } from "@/lib/content/wedding";

/** Centred column for the sign-in and password screens. */
export function LoginShell({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-8 px-6 pt-[clamp(48px,14vh,120px)] pb-12">
      <header className="flex flex-col items-center gap-2.5 text-center">
        <p className="m-0 font-script text-[48px] leading-tight">{wedding.coupleNames}</p>
        <h1 className="type-org-title m-0">{title}</h1>
        {lead && <p className="m-0 text-ink-2">{lead}</p>}
      </header>
      {children}
    </main>
  );
}
