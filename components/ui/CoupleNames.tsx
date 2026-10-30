import { cn } from "@/lib/cn";

const sizes = {
  hero: { name: "text-[68px] leading-[0.95]", amp: "text-[52px]" },
  lg: { name: "text-[54px] leading-none", amp: "text-[44px]" },
  md: { name: "text-[42px] leading-none", amp: "text-[34px]" },
} as const;

/**
 * The couple's names ("Kay & Ama") in italic Cormorant with a Great Vibes ampersand.
 * `stacked` puts the second name on its own line, as on the hero.
 * `entrance` slides the first name in from the left and "& B" from the right.
 * `partners` comes from getWedding().
 */
export function CoupleNames({
  partners,
  size = "lg",
  stacked,
  entrance,
  as: Tag = "span",
  className,
}: {
  partners: readonly [string, string];
  size?: keyof typeof sizes;
  stacked?: boolean;
  entrance?: boolean;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
}) {
  const [a, b] = partners;
  const s = sizes[size];
  return (
    <Tag className={cn("m-0 font-display font-light italic", s.name, className)}>
      <span className={cn("inline-block", entrance && "motion-from-left [--rise-delay:400ms]")}>{a}</span>
      {stacked ? <br /> : " "}
      {/* Keep "& B" together so a long pair breaks before the ampersand, not after it. */}
      <span className={cn("inline-block whitespace-nowrap", entrance && "motion-from-right [--rise-delay:650ms]")}>
        <span className={cn("font-script not-italic", s.amp)}>&amp;</span> {b}
      </span>
    </Tag>
  );
}
