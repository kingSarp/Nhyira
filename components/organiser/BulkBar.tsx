"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sticky bar above the request list: "select all" and a live count.
 * The approve/decline buttons are passed in and submit the surrounding form,
 * so ticking and approving still works without JS (minus select-all).
 */
export function BulkBar({ total, children }: { total: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const update = () => setCount(form.querySelectorAll<HTMLInputElement>('input[name="ids"]:checked').length);
    form.addEventListener("change", update);
    return () => form.removeEventListener("change", update);
  }, []);

  const toggleAll = (on: boolean) => {
    const form = ref.current?.closest("form");
    form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((b) => (b.checked = on));
    setCount(on ? total : 0);
  };

  return (
    <div ref={ref} className="sticky top-0 z-10 -mx-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-paper px-5 py-3 lg:mx-0 lg:px-4">
      <label className="flex min-h-11 items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          className="size-5 accent-accent"
          checked={count === total && total > 0}
          ref={(el) => {
            if (el) el.indeterminate = count > 0 && count < total;
          }}
          onChange={(e) => toggleAll(e.target.checked)}
        />
        {count ? `${count} selected` : "Select all"}
      </label>
      <div className="ml-auto flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
