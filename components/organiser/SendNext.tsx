"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

/**
 * Opens WhatsApp in a new tab, then refreshes this page so the next household
 * is ready when the organiser comes back.
 */
export function SendNext({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setTimeout(() => router.refresh(), 800)}
      className="type-button inline-flex h-[var(--control-h)] w-full items-center justify-center gap-2 rounded-full bg-success px-8 text-white no-underline hover:text-white hover:brightness-110 sm:w-auto"
    >
      <Icon name="whatsapp" size={20} />
      {label}
    </a>
  );
}
