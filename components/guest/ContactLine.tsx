import { cn } from "@/lib/cn";
import { wedding } from "@/lib/content/wedding";

/** "Questions? Auntie Efua · 024…". Links the number once it's a real one. */
export function ContactLine({ lead = "Questions?", className }: { lead?: string; className?: string }) {
  const { name, phone } = wedding.contact;
  const dialable = /\d{6,}/.test(phone.replace(/\s/g, ""));
  return (
    <p className={cn("m-0 text-[14px]", className)}>
      {lead} {name} ·{" "}
      {dialable ? (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-current hover:text-current">
          {phone}
        </a>
      ) : (
        phone
      )}
    </p>
  );
}
