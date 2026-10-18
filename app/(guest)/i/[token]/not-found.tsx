import { ContactLine } from "@/components/guest/ContactLine";
import { Roses } from "@/components/guest/Roses";
import { CoupleNames } from "@/components/ui";
import { getWedding } from "@/lib/data";

export default async function InvitationNotFound() {
  const { partners } = await getWedding();
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col items-center justify-center gap-[22px] overflow-hidden px-9 text-center">
      <CoupleNames partners={partners} size="md" as="p" className="text-[56px] text-accent" />
      <h1 className="type-title m-0 text-[30px] leading-tight">We couldn&apos;t find this invitation</h1>
      <p className="m-0 text-[16px] text-ink-2">Please open the full link from your WhatsApp message.</p>
      <ContactLine lead="Need help?" className="mt-2 text-[15px] text-ink-2" />
      <Roses size="lg" className="pointer-events-none absolute -right-5 -bottom-5" />
    </main>
  );
}
