import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const control =
  "w-full rounded-input border border-border bg-field px-3.5 text-[17px] text-ink " +
  "focus:outline-none focus:border-2 focus:border-accent focus:px-[13px] " +
  "aria-[invalid=true]:border-2 aria-[invalid=true]:border-error aria-[invalid=true]:px-[13px]";

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 flex items-center gap-1.5 text-[15px] text-error">
      <Icon name="alert" size={16} />
      {children}
    </p>
  );
}

type LabelProps = { label: string; error?: string; hint?: string; action?: ReactNode };

export function TextField({
  id,
  label,
  error,
  hint,
  action,
  className,
  ...input
}: LabelProps & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="type-label text-ink-2">
          {label}
        </label>
        {action}
      </div>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(control, "h-[52px]")}
        {...input}
      />
      {hint && !error && (
        <p id={hintId} className="m-0 text-[15px] text-ink-2">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function TextArea({
  id,
  label,
  error,
  className,
  ...textarea
}: LabelProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="type-label text-ink-2">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(control, "min-h-24 py-3 leading-normal")}
        {...textarea}
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
