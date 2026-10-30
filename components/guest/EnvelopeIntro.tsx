"use client";

import { useEffect, useRef, useState } from "react";

/** Fired when the envelope is opened; the music player starts on it (same tap, so phones allow sound). */
export const OPEN_EVENT = "nhyira:open";

/** Removes the pause on the page's load animations (see `[data-sealed]` in globals.css). */
function unseal() {
  document.querySelector("[data-sealed]")?.removeAttribute("data-sealed");
}

/**
 * A sealed envelope over the page until the guest taps it: the flap lifts, the
 * card slides up and it fades away. Once per browser session per `storageKey`.
 * Server-rendered so it covers the page from the first paint; `GuestPage
 * sealed` hides it (and unpauses the page) when JavaScript is off.
 */
export function EnvelopeIntro({ to, monogram, storageKey }: { to: string; monogram: readonly [string, string]; storageKey: string }) {
  const [stage, setStage] = useState<"closed" | "opening" | "fading" | "gone">("closed");
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(storageKey) === "1";
    } catch {}
    if (seen) {
      unseal();
      // Already opened this session: skip it.
      const id = requestAnimationFrame(() => setStage("gone"));
      return () => cancelAnimationFrame(id);
    }
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    button.current?.focus();
    return () => {
      root.style.overflow = overflow;
    };
  }, [storageKey]);

  useEffect(() => {
    if (stage === "gone") document.documentElement.style.overflow = "";
  }, [stage]);

  function open() {
    if (stage !== "closed") return;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    window.dispatchEvent(new Event(OPEN_EVENT));
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStage("opening");
    setTimeout(
      () => {
        unseal();
        setStage("fading");
        setTimeout(() => {
          setStage("gone");
          document.querySelector("main")?.focus({ preventScroll: true });
        }, quick ? 0 : 600);
      },
      quick ? 0 : 1000,
    );
  }

  if (stage === "gone") return null;
  const isOpen = stage !== "closed";

  return (
    <div
      data-open={isOpen}
      data-fading={stage === "fading"}
      className="envelope-intro group fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-paper px-6 transition-opacity duration-500 data-[fading=true]:opacity-0"
    >
      <button
        ref={button}
        type="button"
        onClick={open}
        aria-label={`Open your invitation. ${to}`}
        className="relative block aspect-[10/7] w-[min(84vw,340px)] cursor-pointer border-0 bg-transparent p-0 [perspective:900px]"
      >
        {/* Back of the envelope */}
        <span aria-hidden className="absolute inset-0 bg-panel shadow-overlay" />
        {/* The card inside, which slides up */}
        <span
          aria-hidden
          className="absolute inset-x-[6%] top-[8%] bottom-[6%] flex flex-col items-center justify-center gap-1 border border-line bg-paper transition-transform delay-300 duration-700 ease-out group-data-[open=true]:-translate-y-[45%]"
        >
          <span className="type-eyebrow text-[10px]">You&rsquo;re invited</span>
          <span className="font-display text-[22px] italic">
            {monogram[0]} &amp; {monogram[1]}
          </span>
        </span>
        {/* Front pocket */}
        <span aria-hidden className="absolute inset-0 bg-panel [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
        <span aria-hidden className="absolute inset-0 border border-line" />
        {/* Flap */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[58%] origin-top bg-quiet-tint transition-transform duration-500 ease-in-out [clip-path:polygon(0_0,100%_0,50%_100%)] group-data-[open=true]:[transform:rotateX(180deg)]"
        />
        {/* Wax seal */}
        <span
          aria-hidden
          className="absolute top-[58%] left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-gold-deep bg-gold font-display text-[20px] text-white italic shadow-float transition-opacity duration-300 group-data-[open=true]:opacity-0"
        >
          {monogram[0]}
          <span className="font-script not-italic">&amp;</span>
          {monogram[1]}
        </span>
      </button>

      <div aria-hidden className="flex flex-col items-center gap-2 text-center transition-opacity duration-300 group-data-[open=true]:opacity-0">
        <p className="type-greeting m-0 text-[34px]">{to}</p>
        <p className="type-eyebrow m-0">Tap to open</p>
      </div>
    </div>
  );
}
