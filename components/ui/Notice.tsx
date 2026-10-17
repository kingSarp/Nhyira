import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Tone = "info" | "success" | "error";

const tones: Record<Tone, { box: string; icon: string; defaultIcon: IconName }> = {
  info: { box: "bg-panel", icon: "text-accent", defaultIcon: "lock" },
  success: { box: "bg-success-tint", icon: "text-success", defaultIcon: "mail" },
  error: { box: "bg-error-tint", icon: "text-error", defaultIcon: "alert" },
};

export function Notice({
  tone = "info",
  icon,
  title,
  children,
  className,
}: {
  tone?: Tone;
  icon?: IconName;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 px-[18px] py-4 text-[15px] leading-relaxed text-ink", t.box, className)}
    >
      <Icon name={icon ?? t.defaultIcon} size={20} className={cn("mt-0.5 flex-none", t.icon)} />
      <div>
        {title && <strong className={cn("block font-semibold", tone === "info" ? "text-ink" : t.icon)}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}

/** Top-of-form summary listing each problem as a link to its field. */
export function ErrorSummary({ title, errors }: { title: string; errors: { href: string; text: string }[] }) {
  return (
    <div role="alert" className="flex flex-col gap-2 border border-error bg-field px-[18px] py-4">
      <strong className="font-semibold text-error">{title}</strong>
      {errors.map((e) => (
        <a key={e.href} href={e.href} className="text-[15px] text-ink">
          {e.text}
        </a>
      ))}
    </div>
  );
}
