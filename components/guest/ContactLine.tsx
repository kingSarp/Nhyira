import { cn } from "@/lib/cn";
import { getWedding } from "@/lib/data";

/** "Questions? Auntie Efua · 024…". The number is a tap-to-call link; left out until it's set. */
export async function ContactLine({ lead = "Questions?", className }: { lead?: string; className?: string }) {
  const { name, phone } = (await getWedding()).contact;
  return (
    <p className={cn("m-0 text-[14px]", className)}>
      {lead} {name}
      {phone && (
        <>
          {" · "}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-current hover:text-current">
            {phone}
          </a>
        </>
      )}
    </p>
  );
}
