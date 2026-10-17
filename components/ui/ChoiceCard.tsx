import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  children: ReactNode;
  invalid?: boolean;
};

/**
 * A radio (or checkbox) wrapped in a full-width tappable card.
 * The selected look comes from CSS :has(:checked), so it works without JS.
 */
export function ChoiceCard({ children, invalid, className, type = "radio", ...input }: Props) {
  return (
    <label
      className={cn(
        "flex min-h-[var(--control-h)] cursor-pointer items-center gap-3 rounded-input border border-border bg-field px-4 text-[17px] text-ink",
        "has-[:checked]:border-2 has-[:checked]:border-accent has-[:checked]:bg-paper has-[:checked]:px-[15px]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-accent",
        invalid && "border-2 border-error px-[15px]",
        className,
      )}
    >
      <input type={type} className="m-0 size-5 accent-accent focus-visible:outline-none" {...input} />
      {children}
    </label>
  );
}
