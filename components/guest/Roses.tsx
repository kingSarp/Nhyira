import Image from "next/image";
import { cn } from "@/lib/cn";
import { wedding } from "@/lib/content/wedding";

/** The decorative rose sprig. Always empty alt. */
export function Roses({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: [120, 138], md: [150, 172], lg: [240, 276] }[size];
  return (
    <Image
      src={wedding.images.roses.src}
      alt=""
      width={s[0]}
      height={s[1]}
      className={cn("object-contain", className)}
      style={{ width: s[0], height: s[1] }}
    />
  );
}
