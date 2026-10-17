import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-8 type-button no-underline transition-colors duration-150 ease-standard " +
  "h-[var(--control-h)] disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent disabled:bg-quiet-tint disabled:text-ink-2",
  secondary: "border border-ink text-ink bg-transparent hover:bg-panel hover:text-ink",
  whatsapp:
    "border border-success text-success bg-transparent hover:bg-success-tint hover:text-success px-5 !h-11 normal-case tracking-normal text-[15px] " +
    "disabled:border-dashed disabled:border-border disabled:text-ink-2 disabled:font-normal disabled:hover:bg-transparent",
};

type Common = {
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & { href: string; external?: boolean };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", fullWidth, className, children } = props;
  const classes = cn(base, variants[variant], fullWidth && "w-full", className);
  const content = (
    <>
      {variant === "whatsapp" && <Icon name="whatsapp" />}
      {children}
    </>
  );

  if (props.href !== undefined) {
    const { href, external } = props as AsLink;
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, fullWidth: _f, className: _c, children: _ch, type = "button", ...rest } = props as AsButton;
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
