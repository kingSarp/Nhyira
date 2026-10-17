import { cn } from "@/lib/cn";
import { wedding } from "@/lib/content/wedding";

const sizes = {
  hero: { name: "text-[68px] leading-[0.95]", amp: "text-[52px]" },
  lg: { name: "text-[54px] leading-none", amp: "text-[44px]" },
  md: { name: "text-[42px] leading-none", amp: "text-[34px]" },
} as const;

/**
 * "Yaw & Lady" in italic Cormorant with a Great Vibes ampersand.
 * `stacked` puts the second name on its own line, as on the hero.
 */
export function CoupleNames({
  size = "lg",
  stacked,
  as: Tag = "span",
  className,
}: {
  size?: keyof typeof sizes;
  stacked?: boolean;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
}) {
  const [a, b] = wedding.partners;
  const s = sizes[size];
  return (
    <Tag className={cn("m-0 font-display font-light italic", s.name, className)}>
      {a}
      {stacked ? <br /> : " "}
      <span className={cn("font-script not-italic", s.amp)}>&amp;</span> {b}
    </Tag>
  );
}
