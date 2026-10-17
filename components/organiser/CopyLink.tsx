"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

/** The link in a read-only box, with Copy. */
export function CopyLink({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="type-label text-ink-2">{label}</span>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          aria-label={label}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 min-w-0 flex-1 rounded-input border border-border bg-field px-3 text-[15px] text-ink focus:border-2 focus:border-accent focus:px-[11px] focus:outline-none"
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard blocked: the box is selectable instead */
            }
          }}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-ink bg-transparent px-4 text-[15px] text-ink hover:bg-panel"
        >
          <Icon name={copied ? "check" : "copy"} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
