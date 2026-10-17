"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Guests · Requests · Sign-up links. The active tab gets a 2px underline. */
export function AdminTabs({ pending }: { pending: number }) {
  const path = usePathname();
  const tabs = [
    { href: "/admin", label: "Guests" },
    { href: "/admin/requests", label: "Requests", count: pending },
    { href: "/admin/links", label: "Sign-up links" },
  ];
  return (
    <nav aria-label="Dashboard" className="-mx-5 overflow-x-auto border-b border-line px-5 lg:mx-0 lg:px-0">
      <ul className="m-0 flex list-none gap-7 p-0">
        {tabs.map((t) => {
          const active =
            t.href === "/admin" ? path === "/admin" || path.startsWith("/admin/guests") || path.startsWith("/admin/send") : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 text-[16px] tracking-[0.04em] no-underline",
                  active ? "border-ink text-ink hover:text-ink" : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                {t.label}
                {t.count ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[12px] leading-none text-on-accent">
                    {t.count}
                    <span className="sr-only"> waiting</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
